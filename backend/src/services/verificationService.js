/**
 * Verification Services - SANC, BHF, SA ID, Medical Aid
 */

const { validateSAIdNumber } = require('../utils/validation');

// Mock SANC Registry data
const mockSANCRegistry = {
    'SANC123456': {
        name: 'Sarah van der Berg',
        status: 'Active',
        specialty: 'Renal Nursing',
        renewalDate: '2025-12-31',
        registrationDate: '2010-03-15'
    },
    'SANC234567': {
        name: 'John Michael Smith',
        status: 'Active',
        specialty: 'Critical Care Nursing',
        renewalDate: '2025-06-30',
        registrationDate: '2015-01-20'
    },
    'SANC345678': {
        name: 'Maria Nkosi',
        status: 'Active',
        specialty: 'Dialysis Nursing',
        renewalDate: '2026-03-01',
        registrationDate: '2012-08-10'
    },
    'SANC456789': {
        name: 'David Botha',
        status: 'Active',
        specialty: 'General Nursing',
        renewalDate: '2025-09-15',
        registrationDate: '2018-02-28'
    },
    'SANC567890': {
        name: 'Lisa Mokoena',
        status: 'Suspended',
        specialty: 'Renal Nursing',
        renewalDate: '2024-01-01',
        registrationDate: '2016-05-12'
    }
};

// Mock BHF Registry data
const mockBHFRegistry = {
    'BHF789012': {
        providerName: 'Sarah van der Berg',
        schemes: ['Discovery Health', 'Bonitas', 'Medihelp', 'Gems'],
        status: 'Active',
        providerType: 'Independent Practice'
    },
    'BHF890123': {
        providerName: 'John Michael Smith',
        schemes: ['Discovery Health', 'Momentum', 'Medshield'],
        status: 'Active',
        providerType: 'Hospital Based'
    },
    'BHF901234': {
        providerName: 'Maria Nkosi',
        schemes: ['Bonitas', 'Sizwe', 'Naspers'],
        status: 'Active',
        providerType: 'Independent Practice'
    },
    'BHF012345': {
        providerName: 'David Botha',
        schemes: ['Discovery Health', 'Medihelp', 'Bankmed'],
        status: 'Active',
        providerType: 'Clinic Based'
    }
};

// Mock Medical Aid Registry
const mockMedicalAidRegistry = {
    'DH123456789': {
        scheme: 'Discovery Health',
        memberName: 'John Doe',
        coverageType: 'Comprehensive',
        dependents: 2,
        status: 'Active'
    },
    'BT987654321': {
        scheme: 'Bonitas',
        memberName: 'Jane Smith',
        coverageType: 'Standard',
        dependents: 1,
        status: 'Active'
    },
    'MM555444333': {
        scheme: 'Medihelp',
        memberName: 'Bob Johnson',
        coverageType: 'Hospital Plan',
        dependents: 3,
        status: 'Active'
    },
    'GD666777888': {
        scheme: 'Gems',
        memberName: 'Alice Williams',
        coverageType: 'Government Employees',
        dependents: 4,
        status: 'Active'
    }
};

// Verify SANC registration number
const verifySANC = async (registrationNumber) => {
    const cleanSanc = registrationNumber.replace(/[-\s]/g, '').toUpperCase();
    const normalizedSanc = cleanSanc.startsWith('SANC') ? cleanSanc : `SANC${cleanSanc}`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check mock registry
    const record = mockSANCRegistry[normalizedSanc];
    
    if (record) {
        return {
            valid: record.status === 'Active',
            name: record.name,
            status: record.status,
            specialty: record.specialty,
            renewalDate: record.renewalDate,
            registrationDate: record.registrationDate,
            message: record.status === 'Active' 
                ? 'SANC registration verified' 
                : 'SANC registration is not active'
        };
    }
    
    // For demo purposes, accept valid format SANC-XXXXXX
    if (/^SANC\d{6}$/.test(normalizedSanc)) {
        return {
            valid: true,
            name: 'Registered Nurse',
            status: 'Active',
            specialty: 'General Nursing',
            renewalDate: '2025-12-31',
            registrationDate: '2020-01-01',
            message: 'SANC registration verified (demo)'
        };
    }
    
    return {
        valid: false,
        error: 'SANC registration number not found in registry'
    };
};

// Verify BHF provider number
const verifyBHF = async (providerNumber) => {
    const cleanBhf = providerNumber.replace(/[-\s]/g, '').toUpperCase();
    const normalizedBhf = cleanBhf.startsWith('BHF') ? cleanBhf : `BHF${cleanBhf}`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check mock registry
    const record = mockBHFRegistry[normalizedBhf];
    
    if (record) {
        return {
            valid: record.status === 'Active',
            providerName: record.providerName,
            schemes: record.schemes,
            status: record.status,
            providerType: record.providerType,
            message: record.status === 'Active'
                ? 'BHF provider verified'
                : 'BHF provider is not active'
        };
    }
    
    // For demo purposes, accept valid format
    if (/^BHF[A-Z0-9]{4,10}$/.test(normalizedBhf)) {
        return {
            valid: true,
            providerName: 'Registered Healthcare Provider',
            schemes: ['Discovery Health', 'Bonitas'],
            status: 'Active',
            providerType: 'Independent Practice',
            message: 'BHF provider verified (demo)'
        };
    }
    
    return {
        valid: false,
        error: 'BHF provider number not found in registry'
    };
};

// Validate South African ID number
const validateSAId = async (idNumber) => {
    const result = validateSAIdNumber(idNumber);
    
    if (!result.valid) {
        return {
            valid: false,
            error: result.error
        };
    }
    
    return {
        valid: true,
        dateOfBirth: result.data.dateOfBirth,
        gender: result.data.gender,
        citizenship: result.data.citizenship,
        message: 'SA ID number is valid'
    };
};

// Verify medical aid and confirm coverage
const verifyMedicalAid = async (medicalAidNumber, idNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate the ID first
    const idValidation = validateSAIdNumber(idNumber);
    if (!idValidation.valid) {
        return {
            valid: false,
            error: 'Invalid ID number provided'
        };
    }
    
    // Check mock registry
    const record = mockMedicalAidRegistry[medicalAidNumber];
    
    if (record) {
        return {
            valid: record.status === 'Active',
            scheme: record.scheme,
            memberName: record.memberName,
            coverageType: record.coverageType,
            dependents: record.dependents,
            status: record.status,
            message: record.status === 'Active'
                ? 'Medical aid coverage confirmed'
                : 'Medical aid is not active'
        };
    }
    
    // For demo purposes, accept valid format
    if (medicalAidNumber.length >= 6) {
        return {
            valid: true,
            scheme: 'South African Medical Aid',
            memberName: 'Member',
            coverageType: 'Standard',
            dependents: 0,
            status: 'Active',
            message: 'Medical aid coverage confirmed (demo)'
        };
    }
    
    return {
        valid: false,
        error: 'Medical aid number not found'
    };
};

// Lookup medical aid by ID number
const lookupMedicalAidById = async (idNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate the ID first
    const idValidation = validateSAIdNumber(idNumber);
    if (!idValidation.valid) {
        return {
            found: false,
            error: 'Invalid ID number provided'
        };
    }
    
    // In real implementation, this would search medical aid databases
    // For demo, return not found (most cases won't have registered medical aid)
    return {
        found: false,
        message: 'No medical aid records found for this ID number'
    };
};

module.exports = {
    verifySANC,
    verifyBHF,
    validateSAId,
    verifyMedicalAid,
    lookupMedicalAidById
};
