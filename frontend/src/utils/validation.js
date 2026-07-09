// SA ID Number Validation
export const validateSAID = (idNumber) => {
  if (!idNumber || idNumber.length !== 13) {
    return { valid: false, error: 'ID number must be 13 digits' };
  }

  if (!/^\d+$/.test(idNumber)) {
    return { valid: false, error: 'ID number must contain only digits' };
  }

  // Extract date parts
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));

  // Validate date
  const fullYear = year > 50 ? 1900 + year : 2000 + year;
  const date = new Date(fullYear, month - 1, day);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, error: 'Invalid date in ID number' };
  }

  // Luhn algorithm adapted for SA ID
  let sum = 0;
  let isEven = false;
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid ID number checksum' };
  }

  return {
    valid: true,
    dateOfBirth: `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    gender: parseInt(idNumber[6]) >= 5 ? 'male' : 'female',
    citizenship: parseInt(idNumber[10]) === 0 ? 'SA Citizen' : 'Permanent Resident',
  };
};

// Extract birth date from SA ID
export const extractBirthDate = (idNumber) => {
  if (!idNumber || idNumber.length !== 13) return null;
  
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));
  const fullYear = year > 50 ? 1900 + year : 2000 + year;
  
  return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (SA format)
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const saPhoneRegex = /^(\+27|27|0)[6-8][0-9]{8}$/;
  return saPhoneRegex.test(cleaned);
};

// Medical aid number validation
export const validateMedicalAidNumber = (number) => {
  if (!number || number.length < 5) {
    return { valid: false, error: 'Medical aid number must be at least 5 characters' };
  }
  return { valid: true };
};

// SANC registration validation
export const validateSANC = (number) => {
  const sancRegex = /^SANC[-]?[0-9]{6}$/i;
  if (!sancRegex.test(number)) {
    return { valid: false, error: 'Invalid SANC registration format (expected: SANC-XXXXXX)' };
  }
  return { valid: true };
};

// BHF provider number validation
export const validateBHF = (number) => {
  const bhfRegex = /^BHF[-]?[0-9]{6}$/i;
  if (!bhfRegex.test(number)) {
    return { valid: false, error: 'Invalid BHF provider format (expected: BHF-XXXXXX)' };
  }
  return { valid: true };
};
