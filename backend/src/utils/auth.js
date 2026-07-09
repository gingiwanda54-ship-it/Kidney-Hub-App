/**
 * Authentication utilities for Kidney Hub API
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user, expiresIn = process.env.JWT_EXPIRES_IN || '24h') => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (user) => {
    const payload = {
        userId: user.id,
        type: 'refresh'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' 
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash password
const hashPassword = async (password) => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return bcrypt.hash(password, rounds);
};

// Compare password
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique session token
const generateSessionToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    hashPassword,
    comparePassword,
    generateOTP,
    generateSessionToken
};
