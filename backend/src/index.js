/**
 * Kidney Hub Backend API
 * Main entry point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const nursesRoutes = require('./routes/nurses');
const patientsRoutes = require('./routes/patients');
const verificationRoutes = require('./routes/verification');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const indemnityRoutes = require('./routes/indemnity');
const aiRoutes = require('./routes/ai');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { getDatabase, initDatabase, closeDatabase } = require('./models/database');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// FIX 7: Strict Helmet CSP Configuration
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
}));

// ============================================
// FIX 1: CORS - Require FRONTEND_URL, no wildcard
// ============================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        error: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ============================================
// FIX 8: AI Rate Limiting - 5 requests per minute per user
// ============================================
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, error: 'Too many AI requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Kidney Hub API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root route — required for Cloud Run startup probe (hits / by default)
app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/ai/chat', aiLimiter);
app.use('/api', generalLimiter);

// ============================================
// FIX 6: Protected File Serving
// ============================================
app.get('/api/files/:filename', authenticate, (req, res) => {
    const { filename } = req.params;
    
    // Prevent path traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ success: false, error: 'Invalid filename' });
    }
    
    const filepath = path.join(__dirname, '../uploads', filename);
    
    // Verify file exists
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    res.sendFile(filepath);
});

// ============================================
// FIX 13: Remove API Route Listing (protect /api endpoint)
// ============================================
app.get('/api', (req, res) => {
    // Only show basic info, no route enumeration
    res.json({
        success: true,
        message: 'Kidney Hub API',
        version: '1.0.0',
        status: 'operational'
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/nurses', nursesRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/indemnity', indemnityRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server function
// Global error handlers for startup diagnostics
process.on('unhandledRejection', (reason, promise) => {
    console.error('[STARTUP ERROR] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[STARTUP ERROR] Uncaught Exception:', err.message, err.stack);
});

const startServer = async () => {
    console.log('[STARTUP] startServer beginning...');
    try {
        // Initialize database (module auto-inits on load; this ensures it's ready)
        const { initDatabase } = require('./models/database');
        console.log('[STARTUP] Calling initDatabase...');
        await initDatabase();
        console.log('[STARTUP] initDatabase completed');
        
        // Auto-seed demo users
        console.log('[STARTUP] Seeding demo users...');
        await seedDemoUsers();
        console.log('[STARTUP] Demo users seeded');
        
        // Start listening
        console.log('[STARTUP] Calling app.listen on port', PORT);
        app.listen(PORT, () => {
            console.log('[STARTUP] SUCCESS: Server is now listening on port', PORT);
            console.log(`\n╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏥  Kidney Hub Backend API                                  ║
║                                                               ║
║   Server running on port ${PORT}                                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                               ║
║   Endpoints:                                                  ║
║   • Health: http://localhost:${PORT}/health                     ║
║   • API:     http://localhost:${PORT}/api                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
            `);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            closeDatabase();
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            console.log('SIGINT received. Shutting down gracefully...');
            closeDatabase();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Auto-seed demo users on startup
const seedDemoUsers = async () => {
    // Wait for database to be ready (up to 10 seconds)
    let db = getDatabase();
    let waitCount = 0;
    while (!db && waitCount < 100) {
        await new Promise(r => setTimeout(r, 100));
        db = getDatabase();
        waitCount++;
    }
    if (!db) { console.log('Database not ready, skipping seed'); return; }
    const bcrypt = require('bcryptjs');
    const demoUsers = [
        { email: 'patient@test.com', password: 'Demo@1234', role: 'patient', firstName: 'Demo', lastName: 'Patient', phone: '+27820000001', saIdNumber: '8801015009089', medicalAidNumber: 'DH123456789', medicalAidScheme: 'Discovery Health' },
        { email: 'nurse@test.com', password: 'Demo@1234', role: 'nurse', firstName: 'Demo', lastName: 'Nurse', phone: '+27820000002', sancNumber: 'SANC123456', bhfNumber: 'BHF789012' },
        { email: 'admin@test.com', password: 'Demo@1234', role: 'admin', firstName: 'Demo', lastName: 'Admin', phone: '+27820000003' }
    ];
    for (const user of demoUsers) {
        try {
            // Check if user exists using db.prepare() API
            const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
            stmt.bind([user.email]);
            const exists = stmt.step();
            stmt.free();
            if (exists) { console.log('Demo user already exists: ' + user.email); continue; }
            
            const passwordHash = await bcrypt.hash(user.password, 12);
            db.run('INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, two_factor_enabled) VALUES (?, ?, ?, ?, ?, ?, 1, 0)', [user.email, passwordHash, user.role, user.firstName, user.lastName, user.phone]);
            
            // Get last insert id
            const idStmt = db.prepare('SELECT last_insert_rowid() as id');
            idStmt.step();
            const userId = idStmt.getAsObject().id;
            idStmt.free();
            
            if (user.role === 'patient') {
                db.run('INSERT INTO patients (user_id, sa_id_number, medical_aid_number, medical_aid_scheme, preferred_language) VALUES (?, ?, ?, ?, ?)', [userId, user.saIdNumber, user.medicalAidNumber, user.medicalAidScheme, 'English']);
            } else if (user.role === 'nurse') {
                db.run('INSERT INTO nurses (user_id, sanc_registration_number, sanc_verified, bhf_provider_number, bhf_verified, specialization, years_experience, languages_spoken, consultation_fee, consultation_types, bio, location_city, location_province, is_accepting_patients, profile_completion) VALUES (?, ?, 1, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [userId, user.sancNumber, user.bhfNumber, 'Renal Nursing', 10, '["English"]', 450.00, 'both', 'Demo renal nurse.', 'Cape Town', 'Western Cape', 1, 80]);
            }
            console.log('Seeded demo user: ' + user.email);
        } catch (err) { console.log('Demo user note: ' + user.email + ' - ' + err.message); }
    }
};

// Start the server
startServer();

module.exports = app;
