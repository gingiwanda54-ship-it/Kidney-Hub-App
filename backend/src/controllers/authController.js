/**
 * Authentication Controller
 * Security-hardened version with account lockout and encryption
 */

const { db, getDatabase } = require('../models/database');
const { 
    generateToken, 
    generateRefreshToken, 
    hashPassword, 
    comparePassword, 
    generateOTP,
    generateSessionToken 
} = require('../utils/auth');
const { sendOTP, verifyOTP } = require('../services/twilioService');
const { logAudit } = require('../middleware/auditLog');
const { validatePassword } = require('../utils/validation');
const { encrypt } = require('../utils/encryption');

// ============================================
// FIX 5: Account Lockout Constants
// ============================================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// Helper to run db operations as promises
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// ============================================
// FIX 5: Add failed_attempts and locked_until columns to users table if not exists
// ============================================
const ensureLockoutColumns = async () => {
    try {
        const db = getDatabase();
        // Check if columns exist
        const result = db.exec("PRAGMA table_info(users)");
        const columns = result[0]?.values?.map(v => v[1]) || [];
        
        if (!columns.includes('failed_attempts')) {
            db.run("ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0");
        }
        if (!columns.includes('locked_until')) {
            db.run("ALTER TABLE users ADD COLUMN locked_until TEXT");
        }
    } catch (err) {
        console.log('Lockout columns may already exist:', err.message);
    }
};

// Register patient
const registerPatient = async (req, res) => {
    const { email, password, firstName, lastName, phone, saIdNumber, medicalAidNumber } = req.body;
    
    try {
        // Check if email already exists
        const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.error
            });
        }
        
        // Hash password
        const passwordHash = await hashPassword(password);
        
        // Create user
        await dbRun(
            `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, two_factor_enabled, failed_attempts)
             VALUES (?, ?, 'patient', ?, ?, ?, 0, 1, 0)`,
            [email, passwordHash, firstName, lastName, phone]
        );
        
        // Get the last inserted user ID
        const userResult = await dbGet('SELECT last_insert_rowid() as id');
        const userId = userResult.id;
        
        // ============================================
        // FIX 9: Encrypt sensitive data before storing
        // ============================================
        const encryptedSaId = saIdNumber ? encrypt(saIdNumber) : null;
        const encryptedMedicalAid = medicalAidNumber ? encrypt(medicalAidNumber) : null;
        
        // Create patient profile with encrypted data
        await dbRun(
            `INSERT INTO patients (user_id, sa_id_number, medical_aid_number)
             VALUES (?, ?, ?)`,
            [userId, encryptedSaId, encryptedMedicalAid]
        );
        
        // Generate OTP for verification
        await sendOTP(phone, 'registration');
        
        // Log audit
        await logAudit(userId, 'REGISTER_PATIENT', 'users', userId, { email }, req);
        
        res.status(201).json({
            success: true,
            message: 'Patient registered successfully. Please verify your phone number.',
            data: {
                userId,
                email,
                requiresOTP: true
            }
        });
    } catch (error) {
        console.error('Register patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};

// Register nurse
const registerNurse = async (req, res) => {
    const { 
        email, password, firstName, lastName, phone, sancNumber, bhfNumber, 
        languages, experience, consultationType 
    } = req.body;
    
    try {
        // Check if email already exists
        const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.error
            });
        }
        
        // Hash password
        const passwordHash = await hashPassword(password);
        
        // Create user
        await dbRun(
            `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, two_factor_enabled, failed_attempts)
             VALUES (?, ?, 'nurse', ?, ?, ?, 0, 1, 0)`,
            [email, passwordHash, firstName, lastName, phone]
        );
        
        // Get the last inserted user ID
        const userResult = await dbGet('SELECT last_insert_rowid() as id');
        const userId = userResult.id;
        
        // Create nurse profile
        await dbRun(
            `INSERT INTO nurses (user_id, sanc_registration_number, bhf_provider_number, languages_spoken, years_experience, consultation_types)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                sancNumber, 
                bhfNumber || null, 
                languages ? JSON.stringify(languages) : '["English"]',
                experience || 0,
                consultationType || 'both'
            ]
        );
        
        // Generate OTP for verification
        await sendOTP(phone, 'registration');
        
        // Log audit
        await logAudit(userId, 'REGISTER_NURSE', 'users', userId, { email }, req);
        
        res.status(201).json({
            success: true,
            message: 'Nurse registered successfully. Please verify your phone number.',
            data: {
                userId,
                email,
                requiresOTP: true
            }
        });
    } catch (error) {
        console.error('Register nurse error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};

// ============================================
// FIX 5: Login with Account Lockout
// ============================================
const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Ensure lockout columns exist
        await ensureLockoutColumns();
        
        // Find user
        const user = await dbGet(
            `SELECT u.*, p.id as patient_id, n.id as nurse_id
             FROM users u
             LEFT JOIN patients p ON u.id = p.user_id
             LEFT JOIN nurses n ON u.id = n.user_id
             WHERE u.email = ?`,
            [email]
        );
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        // ============================================
        // FIX 5: Check if account is locked
        // ============================================
        if (user.locked_until) {
            const lockExpiry = new Date(user.locked_until);
            if (lockExpiry > new Date()) {
                const remainingMinutes = Math.ceil((lockExpiry - new Date()) / 60000);
                return res.status(423).json({
                    success: false,
                    error: `Account is locked. Please try again in ${remainingMinutes} minutes.`,
                    lockedUntil: user.locked_until
                });
            } else {
                // Lock has expired, reset failed attempts
                await dbRun(
                    'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?',
                    [user.id]
                );
            }
        }
        
        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            // ============================================
            // FIX 5: Increment failed attempts and lock if needed
            // ============================================
            const newFailedAttempts = (user.failed_attempts || 0) + 1;
            
            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
                
                await dbRun(
                    'UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?',
                    [newFailedAttempts, lockUntil.toISOString(), user.id]
                );
                
                await logAudit(user.id, 'ACCOUNT_LOCKED', 'users', user.id, { 
                    email, 
                    failedAttempts: newFailedAttempts,
                    lockUntil: lockUntil.toISOString()
                }, req);
                
                return res.status(423).json({
                    success: false,
                    error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
                    lockedUntil: lockUntil.toISOString()
                });
            }
            
            await dbRun(
                'UPDATE users SET failed_attempts = ? WHERE id = ?',
                [newFailedAttempts, user.id]
            );
            
            await logAudit(user.id, 'LOGIN_FAILED', 'users', user.id, { 
                email, 
                failedAttempts: newFailedAttempts 
            }, req);
            
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        // ============================================
        // FIX 5: Reset failed attempts on successful login
        // ============================================
        await dbRun(
            'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?',
            [user.id]
        );
        
        // Send OTP for 2FA
        await sendOTP(user.phone, 'login');
        
        // Log audit
        await logAudit(user.id, 'LOGIN_ATTEMPT', 'users', user.id, { email }, req);
        
        res.json({
            success: true,
            message: 'OTP sent to your phone',
            data: {
                userId: user.id,
                email: user.email,
                role: user.role,
                requiresOTP: true
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { code, userId, purpose } = req.body;
    
    try {
        // Get user
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId || req.user.id]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Verify OTP
        const otpResult = await verifyOTP(user.phone, code, purpose || 'login');
        
        if (!otpResult.success) {
            // Log failed attempt
            await logAudit(user.id, 'OTP_VERIFY_FAILED', 'users', user.id, { code }, req);
            
            return res.status(401).json({
                success: false,
                error: otpResult.error
            });
        }
        
        // Generate tokens
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const sessionToken = generateSessionToken();
        
        // Save session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await dbRun(
            `INSERT INTO sessions (user_id, token_hash, device_info, ip_address, expires_at)
             VALUES (?, ?, ?, ?, ?)`,
            [user.id, sessionToken, req.get('User-Agent'), req.ip, expiresAt.toISOString()]
        );
        
        // Log successful verification
        await logAudit(user.id, 'OTP_VERIFY_SUCCESS', 'users', user.id, {}, req);
        
        res.json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'OTP verification failed'
        });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    const { userId } = req.body;
    
    try {
        // Get user
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId || req.user.id]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Send OTP
        await sendOTP(user.phone, 'login');
        
        res.json({
            success: true,
            message: 'OTP resent successfully'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resend OTP'
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        
        if (token) {
            // Invalidate session (in a real app, you'd look up the session by token hash)
            await logAudit(req.user.id, 'LOGOUT', 'sessions', null, {}, req);
        }
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await dbGet(
            `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, 
                    u.profile_photo_url, u.is_verified, u.two_factor_enabled, u.created_at,
                    p.id as patient_id, n.id as nurse_id
             FROM users u
             LEFT JOIN patients p ON u.id = p.user_id
             LEFT JOIN nurses n ON u.id = n.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                profilePhotoUrl: user.profile_photo_url,
                isVerified: user.is_verified,
                twoFactorEnabled: user.two_factor_enabled,
                patientId: user.patient_id,
                nurseId: user.nurse_id,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information'
        });
    }
};

module.exports = {
    registerPatient,
    registerNurse,
    login,
    verifyOtp,
    resendOtp,
    logout,
    getCurrentUser
};
