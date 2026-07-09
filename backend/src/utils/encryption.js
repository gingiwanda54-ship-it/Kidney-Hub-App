/**
 * Encryption Utility for Sensitive Data at Rest
 * Uses AES-256-CBC encryption
 */

const crypto = require('crypto');

// Get encryption key from environment (must be 32 bytes / 64 hex chars)
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        console.warn('WARNING: ENCRYPTION_KEY not set. Using fallback for development only.');
        // Fallback for development only - NOT SECURE for production
        return crypto.createHash('sha256').update('development-fallback-key-do-not-use-in-production').digest();
    }
    return Buffer.from(key, 'hex');
};

const IV_LENGTH = 16;

/**
 * Encrypt sensitive data using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - IV:encryptedData format
 */
const encrypt = (text) => {
    if (!text) return text;
    
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt sensitive data using AES-256-CBC
 * @param {string} text - The encrypted text (IV:encryptedData format)
 * @returns {string} - Decrypted text
 */
const decrypt = (text) => {
    if (!text) return text;
    
    try {
        const [ivHex, encrypted] = text.split(':');
        if (!ivHex || !encrypted) {
            // Try to decrypt as plain text (for backwards compatibility)
            return text;
        }
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        // Return as-is if decryption fails (might be plain text)
        return text;
    }
};

/**
 * Hash sensitive data that needs to be searchable but not reversible
 * Uses SHA-256 with salt
 * @param {string} text - The text to hash
 * @returns {string} - Hashed text
 */
const hash = (text) => {
    if (!text) return text;
    
    const salt = process.env.HASH_SALT || 'kidney-hub-salt';
    return crypto.createHash('sha256').update(text + salt).digest('hex');
};

module.exports = {
    encrypt,
    decrypt,
    hash
};
