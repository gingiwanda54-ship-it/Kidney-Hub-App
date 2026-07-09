/**
 * Validation utilities for Kidney Hub API
 */

// SA ID Number Validation (13-digit South African ID)
const validateSAIdNumber = (idNumber) => {
    if (!idNumber || typeof idNumber !== 'string') {
        return { valid: false, error: 'ID number is required' };
    }
    
    // Remove spaces and non-digits
    const cleanId = idNumber.replace(/\s/g, '');
    
    // Check length
    if (cleanId.length !== 13) {
        return { valid: false, error: 'ID number must be 13 digits' };
    }
    
    // Check if all digits
    if (!/^\d+$/.test(cleanId)) {
        return { valid: false, error: 'ID number must contain only digits' };
    }
    
    // Extract date of birth (YYMMDD)
    const year = parseInt(cleanId.substring(0, 2));
    const month = parseInt(cleanId.substring(2, 4));
    const day = parseInt(cleanId.substring(4, 6));
    
    // Determine century (00-99 could be 1900 or 2000)
    let fullYear = year < 20 ? 2000 + year : 1900 + year;
    
    // Validate date
    const dateOfBirth = new Date(fullYear, month - 1, day);
    if (isNaN(dateOfBirth.getTime())) {
        return { valid: false, error: 'Invalid date in ID number' };
    }
    
    // Gender digit (positions 6-7, 0-4 = female, 5-9 = male)
    const genderDigit = parseInt(cleanId.charAt(6));
    const gender = genderDigit < 5 ? 'female' : 'male';
    
    // Citizenship digit (position 10, 0 = SA citizen, 1 = permanent resident)
    const citizenshipDigit = parseInt(cleanId.charAt(10));
    const citizenship = citizenshipDigit === 0 ? 'SA Citizen' : 'Permanent Resident';
    
    // Checksum validation (Luhn algorithm adapted for SA ID)
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanId.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanId.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    const providedCheckDigit = parseInt(cleanId.charAt(12));
    
    if (checkDigit !== providedCheckDigit) {
        return { valid: false, error: 'Invalid checksum in ID number' };
    }
    
    return {
        valid: true,
        data: {
            dateOfBirth: dateOfBirth.toISOString().split('T')[0],
            gender,
            citizenship,
            year,
            month,
            day
        }
    };
};

// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone number validation (South African format)
const validatePhone = (phone) => {
    if (!phone) return { valid: false, error: 'Phone number is required' };
    
    // Remove spaces, dashes, and country code prefix
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^0/, '27');
    
    // South African mobile numbers are 10 digits starting with 0
    const phoneRegex = /^(\+27|27|0)[6-8][0-9]{8}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
        return { valid: false, error: 'Invalid South African phone number' };
    }
    
    return { valid: true, normalized: cleanPhone };
};

// Password validation
const validatePassword = (password) => {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
};

// SANC registration number validation
const validateSANCNumber = (sancNumber) => {
    if (!sancNumber) {
        return { valid: false, error: 'SANC registration number is required' };
    }
    
    // SANC format: SANC-XXXXXX or plain 6-digit number
    const cleanSanc = sancNumber.replace(/[-\s]/g, '').toUpperCase();
    
    if (/^SANC\d{6}$/.test(cleanSanc)) {
        return { valid: true, normalized: cleanSanc };
    }
    
    if (/^\d{6}$/.test(cleanSanc)) {
        return { valid: true, normalized: `SANC${cleanSanc}` };
    }
    
    return { valid: false, error: 'Invalid SANC registration number format' };
};

// BHF provider number validation
const validateBHFNumber = (bhfNumber) => {
    if (!bhfNumber) {
        return { valid: false, error: 'BHF provider number is required' };
    }
    
    // BHF format: BHF-XXXXXX or plain alphanumeric
    const cleanBhf = bhfNumber.replace(/[-\s]/g, '').toUpperCase();
    
    if (/^BHF[A-Z0-9]{4,10}$/.test(cleanBhf)) {
        return { valid: true, normalized: cleanBhf };
    }
    
    if (/^[A-Z0-9]{4,10}$/.test(cleanBhf)) {
        return { valid: true, normalized: `BHF${cleanBhf}` };
    }
    
    return { valid: false, error: 'Invalid BHF provider number format' };
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Sanitize object
const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

module.exports = {
    validateSAIdNumber,
    validateEmail,
    validatePhone,
    validatePassword,
    validateSANCNumber,
    validateBHFNumber,
    sanitizeInput,
    sanitizeObject
};
