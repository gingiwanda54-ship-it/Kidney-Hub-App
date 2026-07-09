/**
 * File upload middleware using multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const profileDir = path.join(uploadDir, 'profiles');
const recordsDir = path.join(uploadDir, 'records');

[profileDir, recordsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'photo') {
            cb(null, profileDir);
        } else {
            cb(null, recordsDir);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

// File filter for records (images and PDFs)
const recordFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'image/heic', 'image/heif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'), false);
    }
};

// Configure multer for profile photos (5MB limit)
const uploadProfile = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    }
});

// Configure multer for record uploads (10MB limit)
const uploadRecordFile = multer({
    storage,
    fileFilter: recordFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB for records
    }
});

// Middleware for profile photo upload
const uploadProfilePhoto = uploadProfile.single('photo');

// Middleware for record file upload
const uploadRecord = uploadRecordFile.single('file');

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'File too large. Maximum size is 10MB for records'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    next();
};

module.exports = {
    upload: multer,
    uploadProfilePhoto,
    uploadRecord,
    handleUploadError
};
