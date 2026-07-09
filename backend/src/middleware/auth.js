/**
 * Authentication middleware
 */

const { verifyToken } = require('../utils/auth');
const { db } = require('../models/database');

// Helper to run db operations as promises
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Authenticate JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token.'
            });
        }
        
        // Check if user still exists and is active
        const user = await dbGet(
            'SELECT id, email, role, is_verified, two_factor_enabled FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found.'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error.'
        });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (decoded) {
            const user = await dbGet(
                'SELECT id, email, role, is_verified, two_factor_enabled FROM users WHERE id = ?',
                [decoded.userId]
            );
            
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        next();
    }
};

// Authorize based on roles
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
        }
        
        next();
    };
};

// Check if user has verified their account
const requireVerified = (req, res, next) => {
    if (!req.user.is_verified) {
        return res.status(403).json({
            success: false,
            error: 'Account verification required.'
        });
    }
    next();
};

// Verify 2FA for sensitive operations
const require2FA = (req, res, next) => {
    if (req.user.two_factor_enabled) {
        // The actual 2FA verification happens via OTP endpoint
        // This middleware just flags that 2FA is required
        req.require2FA = true;
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    requireVerified,
    require2FA
};
