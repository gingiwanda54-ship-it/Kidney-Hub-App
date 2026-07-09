/**
 * Input validation middleware using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { sanitizeObject } = require('../utils/validation');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    // Sanitize all inputs
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    
    next();
};

// Auth validation rules
const registerPatientRules = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain a number')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain a special character'),
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name is required'),
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name is required'),
    body('phone')
        .matches(/^(\+27|27|0)[6-8][0-9]{8}$/)
        .withMessage('Valid South African phone number is required'),
    body('saIdNumber')
        .isLength({ min: 13, max: 13 })
        .isNumeric()
        .withMessage('Valid 13-digit SA ID number is required'),
    body('medicalAidNumber')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Medical aid number must be valid'),
    handleValidationErrors
];

const registerNurseRules = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain a number')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain a special character'),
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name is required'),
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name is required'),
    body('phone')
        .matches(/^(\+27|27|0)[6-8][0-9]{8}$/)
        .withMessage('Valid South African phone number is required'),
    body('sancNumber')
        .matches(/^SANC\d{6}$|^\d{6}$/)
        .withMessage('Valid SANC registration number is required'),
    body('bhfNumber')
        .optional()
        .matches(/^BHF[A-Z0-9]{4,10}$|^[A-Z0-9]{4,10}$/)
        .withMessage('Invalid BHF provider number format'),
    body('languages')
        .optional()
        .isArray()
        .withMessage('Languages must be an array'),
    body('experience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Experience must be a valid number'),
    body('consultationType')
        .optional()
        .isIn(['in_person', 'virtual', 'both'])
        .withMessage('Invalid consultation type'),
    handleValidationErrors
];

const loginRules = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

const verifyOTPRules = [
    body('code')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('6-digit OTP is required'),
    body('purpose')
        .optional()
        .isIn(['login', 'registration', 'password_reset', 'payment'])
        .withMessage('Invalid OTP purpose'),
    handleValidationErrors
];

// Nurse validation rules
const updateNurseProfileRules = [
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Bio must be less than 1000 characters'),
    body('experience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Experience must be a valid number'),
    body('languages')
        .optional()
        .isArray()
        .withMessage('Languages must be an array'),
    body('consultationType')
        .optional()
        .isIn(['in_person', 'virtual', 'both'])
        .withMessage('Invalid consultation type'),
    body('consultationFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be positive'),
    handleValidationErrors
];

// Patient validation rules
const updatePatientProfileRules = [
    body('emergencyContactName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Emergency contact name is too long'),
    body('emergencyContactPhone')
        .optional()
        .matches(/^(\+27|27|0)[6-8][0-9]{8}$/)
        .withMessage('Invalid phone number'),
    body('addressLine1')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Address line 1 is too long'),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City name is too long'),
    body('province')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Province name is too long'),
    body('postalCode')
        .optional()
        .trim()
        .matches(/^\d{4}$/)
        .withMessage('Postal code must be 4 digits'),
    body('preferredLanguage')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Language preference is too long'),
    handleValidationErrors
];

// Booking validation rules
const createBookingRules = [
    body('nurseId')
        .isInt({ min: 1 })
        .withMessage('Valid nurse ID is required'),
    body('availabilityId')
        .isInt({ min: 1 })
        .withMessage('Valid availability slot ID is required'),
    body('bookingType')
        .isIn(['in_person', 'virtual'])
        .withMessage('Booking type must be in_person or virtual'),
    body('paymentMethod')
        .isIn(['cash', 'medical_aid'])
        .withMessage('Payment method must be cash or medical_aid'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters'),
    handleValidationErrors
];

// Availability validation rules
const createAvailabilityRules = [
    body('availableDate')
        .isISO8601()
        .withMessage('Valid date is required')
        .custom((value) => {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                throw new Error('Date must be in the future');
            }
            return true;
        }),
    body('startTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid start time is required'),
    body('endTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid end time is required'),
    body('consultationType')
        .optional()
        .isIn(['in_person', 'virtual', 'both'])
        .withMessage('Invalid consultation type'),
    handleValidationErrors
];

// Payment validation rules
const initiatePaymentRules = [
    body('bookingId')
        .isInt({ min: 1 })
        .withMessage('Valid booking ID is required'),
    body('amount')
        .isFloat({ min: 1 })
        .withMessage('Valid amount is required'),
    body('paymentMethod')
        .isIn(['card', 'eft'])
        .withMessage('Payment method must be card or eft'),
    handleValidationErrors
];

// Verification validation rules
const verifySAIdRules = [
    body('idNumber')
        .isLength({ min: 13, max: 13 })
        .isNumeric()
        .withMessage('Valid 13-digit SA ID number is required'),
    handleValidationErrors
];

const verifySancRules = [
    body('registrationNumber')
        .matches(/^SANC\d{6}$|^\d{6}$/)
        .withMessage('Valid SANC registration number is required'),
    handleValidationErrors
];

const verifyBhfRules = [
    body('providerNumber')
        .matches(/^BHF[A-Z0-9]{4,10}$|^[A-Z0-9]{4,10}$/)
        .withMessage('Valid BHF provider number is required'),
    handleValidationErrors
];

const verifyMedicalAidRules = [
    body('medicalAidNumber')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Valid medical aid number is required'),
    body('idNumber')
        .isLength({ min: 13, max: 13 })
        .isNumeric()
        .withMessage('Valid 13-digit SA ID number is required'),
    handleValidationErrors
];

// Indemnity validation rules
const signIndemnityRules = [
    body('formType')
        .isIn(['patient', 'nurse'])
        .withMessage('Form type must be patient or nurse'),
    body('signatureData')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Signature data is too long'),
    handleValidationErrors
];

// MongoDB-like ID validation
const mongoIdParam = (paramName) => [
    param(paramName)
        .isInt({ min: 1 })
        .withMessage(`${paramName} must be a valid ID`),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerPatientRules,
    registerNurseRules,
    loginRules,
    verifyOTPRules,
    updateNurseProfileRules,
    updatePatientProfileRules,
    createBookingRules,
    createAvailabilityRules,
    initiatePaymentRules,
    verifySAIdRules,
    verifySancRules,
    verifyBhfRules,
    verifyMedicalAidRules,
    signIndemnityRules,
    mongoIdParam
};
