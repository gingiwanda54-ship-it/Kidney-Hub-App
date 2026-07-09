/**
 * Verification Controller
 */

const { db } = require('../models/database');
const { verifySANC, verifyBHF, validateSAId, verifyMedicalAid, lookupMedicalAidById } = require('../services/verificationService');
const { logAudit } = require('../middleware/auditLog');

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

// Verify SANC registration
const verifySancNumber = async (req, res) => {
    try {
        const { registrationNumber } = req.body;
        
        const result = await verifySANC(registrationNumber);
        
        if (result.valid) {
            // Update nurse record if user is a nurse
            if (req.user && req.user.role === 'nurse') {
                await dbRun(
                    `UPDATE nurses SET sanc_verified = 1, profile_completion = MIN(profile_completion + 25, 100) 
                     WHERE user_id = ?`,
                    [req.user.id]
                );
                
                // Mark user as verified
                await dbRun(
                    `UPDATE users SET is_verified = 1 WHERE id = ?`,
                    [req.user.id]
                );
            }
            
            // Log audit
            await logAudit(req.user?.id, 'VERIFY_SANC', 'nurses', null, { registrationNumber }, req);
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Verify SANC error:', error);
        res.status(500).json({
            success: false,
            error: 'SANC verification failed'
        });
    }
};

// Verify BHF provider number
const verifyBhfNumber = async (req, res) => {
    try {
        const { providerNumber } = req.body;
        
        const result = await verifyBHF(providerNumber);
        
        if (result.valid) {
            // Update nurse record if user is a nurse
            if (req.user && req.user.role === 'nurse') {
                await dbRun(
                    `UPDATE nurses SET bhf_verified = 1, profile_completion = MIN(profile_completion + 15, 100) 
                     WHERE user_id = ?`,
                    [req.user.id]
                );
            }
            
            // Log audit
            await logAudit(req.user?.id, 'VERIFY_BHF', 'nurses', null, { providerNumber }, req);
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Verify BHF error:', error);
        res.status(500).json({
            success: false,
            error: 'BHF verification failed'
        });
    }
};

// Validate SA ID number
const validateSAIdNumber = async (req, res) => {
    try {
        const { idNumber } = req.body;
        
        const result = await validateSAId(idNumber);
        
        if (result.valid) {
            // Update patient record if user is a patient
            if (req.user && req.user.role === 'patient') {
                await dbRun(
                    `UPDATE patients SET date_of_birth = ?, gender = ? WHERE user_id = ?`,
                    [result.dateOfBirth, result.gender, req.user.id]
                );
            }
            
            // Log audit
            await logAudit(req.user?.id, 'VERIFY_SA_ID', 'patients', null, { idNumber: idNumber.substring(0, 4) + '****' }, req);
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Validate SA ID error:', error);
        res.status(500).json({
            success: false,
            error: 'SA ID validation failed'
        });
    }
};

// Verify medical aid
const verifyMedicalAidNumber = async (req, res) => {
    try {
        const { medicalAidNumber, idNumber } = req.body;
        
        const result = await verifyMedicalAid(medicalAidNumber, idNumber);
        
        if (result.valid) {
            // Update patient record if user is a patient
            if (req.user && req.user.role === 'patient') {
                await dbRun(
                    `UPDATE patients SET medical_aid_number = ?, medical_aid_scheme = ? WHERE user_id = ?`,
                    [medicalAidNumber, result.scheme, req.user.id]
                );
            }
            
            // Log audit
            await logAudit(req.user?.id, 'VERIFY_MEDICAL_AID', 'patients', null, { medicalAidNumber }, req);
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Verify medical aid error:', error);
        res.status(500).json({
            success: false,
            error: 'Medical aid verification failed'
        });
    }
};

// Lookup medical aid by ID
const lookupMedicalAid = async (req, res) => {
    try {
        const { idNumber } = req.body;
        
        const result = await lookupMedicalAidById(idNumber);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lookup medical aid error:', error);
        res.status(500).json({
            success: false,
            error: 'Medical aid lookup failed'
        });
    }
};

module.exports = {
    verifySancNumber,
    verifyBhfNumber,
    validateSAIdNumber,
    verifyMedicalAidNumber,
    lookupMedicalAid
};
