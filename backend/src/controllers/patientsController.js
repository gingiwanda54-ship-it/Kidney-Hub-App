/**
 * Patients Controller
 * Security-hardened version with encryption for sensitive data
 */

const { db } = require('../models/database');
const { logAudit } = require('../middleware/auditLog');
const { encrypt, decrypt } = require('../utils/encryption');

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

// Get patient profile
const getPatientProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify access
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this profile'
            });
        }
        
        const patient = await dbGet(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_photo_url,
                    p.id as patient_id, p.sa_id_number, p.medical_aid_number, p.medical_aid_scheme,
                    p.emergency_contact_name, p.emergency_contact_phone, p.date_of_birth,
                    p.gender, p.address_line1, p.address_line2, p.city, p.province,
                    p.postal_code, p.preferred_language, p.chronic_conditions
             FROM patients p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );
        
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        // Decrypt sensitive fields before sending
        const decryptedSaId = patient.sa_id_number ? decrypt(patient.sa_id_number) : null;
        const decryptedMedicalAid = patient.medical_aid_number ? decrypt(patient.medical_aid_number) : null;
        
        res.json({
            success: true,
            data: {
                id: patient.patient_id,
                userId: patient.id,
                email: patient.email,
                firstName: patient.first_name,
                lastName: patient.last_name,
                phone: patient.phone,
                profilePhotoUrl: patient.profile_photo_url,
                saIdNumber: decryptedSaId,
                medicalAidNumber: decryptedMedicalAid,
                medicalAidScheme: patient.medical_aid_scheme,
                emergencyContact: {
                    name: patient.emergency_contact_name,
                    phone: patient.emergency_contact_phone
                },
                dateOfBirth: patient.date_of_birth,
                gender: patient.gender,
                address: {
                    line1: patient.address_line1,
                    line2: patient.address_line2,
                    city: patient.city,
                    province: patient.province,
                    postalCode: patient.postal_code
                },
                preferredLanguage: patient.preferred_language,
                chronicConditions: patient.chronic_conditions
            }
        });
    } catch (error) {
        console.error('Get patient profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patient profile'
        });
    }
};

// Update patient profile
const updatePatientProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            emergencyContactName, emergencyContactPhone, addressLine1, addressLine2,
            city, province, postalCode, preferredLanguage, chronicConditions 
        } = req.body;
        
        // Verify ownership
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }
        
        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (emergencyContactName !== undefined) {
            updates.push('emergency_contact_name = ?');
            params.push(emergencyContactName);
        }
        
        if (emergencyContactPhone !== undefined) {
            updates.push('emergency_contact_phone = ?');
            params.push(emergencyContactPhone);
        }
        
        if (addressLine1 !== undefined) {
            updates.push('address_line1 = ?');
            params.push(addressLine1);
        }
        
        if (addressLine2 !== undefined) {
            updates.push('address_line2 = ?');
            params.push(addressLine2);
        }
        
        if (city !== undefined) {
            updates.push('city = ?');
            params.push(city);
        }
        
        if (province !== undefined) {
            updates.push('province = ?');
            params.push(province);
        }
        
        if (postalCode !== undefined) {
            updates.push('postal_code = ?');
            params.push(postalCode);
        }
        
        if (preferredLanguage !== undefined) {
            updates.push('preferred_language = ?');
            params.push(preferredLanguage);
        }
        
        if (chronicConditions !== undefined) {
            updates.push('chronic_conditions = ?');
            params.push(chronicConditions);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        
        updates.push("updated_at = datetime('now')");
        params.push(id);
        
        await dbRun(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, params);
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update patient profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Upload patient profile photo
const uploadPatientPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        // Verify ownership
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }
        
        const photoUrl = `/uploads/profiles/${req.file.filename}`;
        
        // Update user photo
        await dbRun(
            `UPDATE users SET profile_photo_url = ? WHERE id = (SELECT user_id FROM patients WHERE id = ?)`,
            [photoUrl, id]
        );
        
        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: { photoUrl }
        });
    } catch (error) {
        console.error('Upload patient photo error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload photo'
        });
    }
};

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    uploadPatientPhoto
};
