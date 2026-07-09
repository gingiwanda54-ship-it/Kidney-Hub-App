/**
 * Error handling middleware
 */

// Custom API Error class
class APIError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }
}

// Not found handler
const notFoundHandler = (req, res, next) => {
    const error = new APIError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });
    
    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        error = new APIError('Invalid token', 401);
    }
    
    if (err.name === 'TokenExpiredError') {
        error = new APIError('Token expired', 401);
    }
    
    if (err.code === 'SQLITE_CONSTRAINT') {
        error = new APIError('Duplicate entry', 409);
    }
    
    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new APIError('File too large. Maximum size is 5MB', 413);
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new APIError('Unexpected file field', 400);
    }
    
    // Default to 500 if no status code
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message;
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(error.details && { details: error.details }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    APIError,
    notFoundHandler,
    errorHandler,
    asyncHandler
};
