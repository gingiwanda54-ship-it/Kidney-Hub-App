/**
 * Audit logging middleware
 */

const { db } = require('../models/database');

const logAudit = (userId, action, resourceType, resourceId, details, req) => {
    return new Promise((resolve, reject) => {
        const ipAddress = req ? (req.ip || req.connection?.remoteAddress) : null;
        const userAgent = req ? req.get('User-Agent') : null;
        const detailsJson = details ? JSON.stringify(details) : null;
        
        db.run(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId || null, action, resourceType, resourceId, detailsJson, ipAddress, userAgent],
            (err) => {
                if (err) {
                    console.error('Audit log error:', err);
                    // Don't reject, just log and continue
                    resolve();
                } else {
                    resolve();
                }
            }
        );
    });
};

// Middleware to auto-log data access
const auditLogMiddleware = (action, resourceType) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);
        
        // Override json to capture response
        res.json = (data) => {
            // Log after response is sent
            if (req.user && data && data.success !== false) {
                const resourceId = req.params.id || data.data?.id || null;
                logAudit(
                    req.user.id,
                    action,
                    resourceType,
                    resourceId,
                    { method: req.method, path: req.path },
                    req
                ).catch(err => console.error('Audit log failed:', err));
            }
            
            return originalJson(data);
        };
        
        next();
    };
};

module.exports = {
    logAudit,
    auditLogMiddleware
};
