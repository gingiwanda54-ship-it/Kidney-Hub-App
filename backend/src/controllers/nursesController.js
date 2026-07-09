/**
 * Nurses Controller
 */

const { db } = require('../models/database');
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

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Get all verified nurses with filters
const getAllNurses = async (req, res) => {
    try {
        const { language, experience, consultationType, city, province, specialization } = req.query;
        
        let query = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.profile_photo_url,
                   n.id as nurse_id, n.sanc_registration_number, n.sanc_verified, n.bhf_provider_number,
                   n.bhf_verified, n.specialization, n.years_experience, n.languages_spoken,
                   n.consultation_fee, n.consultation_types, n.bio, n.qualifications,
                   n.location_city, n.location_province, n.is_accepting_patients, n.profile_completion,
                   (SELECT AVG(rating) FROM reviews WHERE nurse_id = n.id) as avg_rating,
                   (SELECT COUNT(*) FROM reviews WHERE nurse_id = n.id) as review_count
            FROM nurses n
            JOIN users u ON n.user_id = u.id
            WHERE u.is_verified = 1 AND n.is_accepting_patients = 1
        `;
        
        const params = [];
        
        if (language) {
            query += ` AND n.languages_spoken LIKE ?`;
            params.push(`%${language}%`);
        }
        
        if (experience) {
            const [minExp, maxExp] = experience.split('-').map(e => e === '+' ? 100 : parseInt(e));
            if (maxExp) {
                query += ` AND n.years_experience BETWEEN ? AND ?`;
                params.push(minExp, maxExp);
            } else {
                query += ` AND n.years_experience >= ?`;
                params.push(minExp);
            }
        }
        
        if (consultationType) {
            query += ` AND n.consultation_types LIKE ?`;
            params.push(`%${consultationType}%`);
        }
        
        if (city) {
            query += ` AND n.location_city LIKE ?`;
            params.push(`%${city}%`);
        }
        
        if (province) {
            query += ` AND n.location_province LIKE ?`;
            params.push(`%${province}%`);
        }
        
        if (specialization) {
            query += ` AND n.specialization = ?`;
            params.push(specialization);
        }
        
        query += ` ORDER BY n.profile_completion DESC, n.years_experience DESC`;
        
        const nurses = await dbAll(query, params);
        
        res.json({
            success: true,
            data: nurses.map(nurse => ({
                id: nurse.nurse_id,
                userId: nurse.id,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                email: nurse.email,
                phone: nurse.phone,
                profilePhotoUrl: nurse.profile_photo_url,
                sancNumber: nurse.sanc_registration_number,
                sancVerified: nurse.sanc_verified,
                bhfNumber: nurse.bhf_provider_number,
                bhfVerified: nurse.bhf_verified,
                specialization: nurse.specialization,
                yearsExperience: nurse.years_experience,
                languages: JSON.parse(nurse.languages_spoken || '[]'),
                consultationFee: nurse.consultation_fee,
                consultationTypes: nurse.consultation_types,
                bio: nurse.bio,
                qualifications: nurse.qualifications,
                location: {
                    city: nurse.location_city,
                    province: nurse.location_province
                },
                isAcceptingPatients: nurse.is_accepting_patients,
                profileCompletion: nurse.profile_completion,
                avgRating: nurse.avg_rating,
                reviewCount: nurse.review_count
            }))
        });
    } catch (error) {
        console.error('Get all nurses error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nurses'
        });
    }
};

// Get nurse profile by ID
const getNurseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nurse = await dbGet(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.profile_photo_url,
                    n.id as nurse_id, n.sanc_registration_number, n.sanc_verified, n.bhf_provider_number,
                    n.bhf_verified, n.specialization, n.years_experience, n.languages_spoken,
                    n.consultation_fee, n.consultation_types, n.bio, n.qualifications,
                    n.location_city, n.location_province, n.is_accepting_patients, n.profile_completion,
                    (SELECT AVG(rating) FROM reviews WHERE nurse_id = n.id) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE nurse_id = n.id) as review_count
             FROM nurses n
             JOIN users u ON n.user_id = u.id
             WHERE n.id = ?`,
            [id]
        );
        
        if (!nurse) {
            return res.status(404).json({
                success: false,
                error: 'Nurse not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: nurse.nurse_id,
                userId: nurse.id,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                email: nurse.email,
                phone: nurse.phone,
                profilePhotoUrl: nurse.profile_photo_url,
                sancNumber: nurse.sanc_registration_number,
                sancVerified: nurse.sanc_verified,
                bhfNumber: nurse.bhf_provider_number,
                bhfVerified: nurse.bhf_verified,
                specialization: nurse.specialization,
                yearsExperience: nurse.years_experience,
                languages: JSON.parse(nurse.languages_spoken || '[]'),
                consultationFee: nurse.consultation_fee,
                consultationTypes: nurse.consultation_types,
                bio: nurse.bio,
                qualifications: nurse.qualifications,
                location: {
                    city: nurse.location_city,
                    province: nurse.location_province
                },
                isAcceptingPatients: nurse.is_accepting_patients,
                profileCompletion: nurse.profile_completion,
                avgRating: nurse.avg_rating,
                reviewCount: nurse.review_count
            }
        });
    } catch (error) {
        console.error('Get nurse by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nurse profile'
        });
    }
};

// Update nurse profile
const updateNurseProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, experience, languages, consultationType, consultationFee, qualifications, location } = req.body;
        
        // Verify ownership
        if (req.user.role === 'nurse' && req.user.nurse_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }
        
        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (bio !== undefined) {
            updates.push('bio = ?');
            params.push(bio);
        }
        
        if (experience !== undefined) {
            updates.push('years_experience = ?');
            params.push(experience);
        }
        
        if (languages !== undefined) {
            updates.push('languages_spoken = ?');
            params.push(JSON.stringify(languages));
        }
        
        if (consultationType !== undefined) {
            updates.push('consultation_types = ?');
            params.push(consultationType);
        }
        
        if (consultationFee !== undefined) {
            updates.push('consultation_fee = ?');
            params.push(consultationFee);
        }
        
        if (qualifications !== undefined) {
            updates.push('qualifications = ?');
            params.push(qualifications);
        }
        
        if (location !== undefined) {
            if (location.city) {
                updates.push('location_city = ?');
                params.push(location.city);
            }
            if (location.province) {
                updates.push('location_province = ?');
                params.push(location.province);
            }
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        
        updates.push("updated_at = datetime('now')");
        params.push(id);
        
        await dbRun(`UPDATE nurses SET ${updates.join(', ')} WHERE id = ?`, params);
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update nurse profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Upload nurse profile photo
const uploadNursePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        // Verify ownership
        if (req.user.role === 'nurse' && req.user.nurse_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }
        
        const photoUrl = `/uploads/profiles/${req.file.filename}`;
        
        // Update nurse photo
        await dbRun(
            `UPDATE nurses SET profile_completion = MIN(profile_completion + 10, 100) WHERE id = ?`,
            [id]
        );
        
        // Update user photo
        await dbRun(
            `UPDATE users SET profile_photo_url = ? WHERE id = (SELECT user_id FROM nurses WHERE id = ?)`,
            [photoUrl, id]
        );
        
        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: { photoUrl }
        });
    } catch (error) {
        console.error('Upload nurse photo error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload photo'
        });
    }
};

// Get nurse availability
const getNurseAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startDate, endDate } = req.query;
        
        let query = `
            SELECT a.*, b.id as booking_id, b.status as booking_status
            FROM availability a
            LEFT JOIN bookings b ON a.id = b.availability_id AND b.status != 'cancelled'
            WHERE a.nurse_id = ? AND a.is_booked = 0
        `;
        
        const params = [id];
        
        if (date) {
            query += ` AND a.available_date = ?`;
            params.push(date);
        } else if (startDate && endDate) {
            query += ` AND a.available_date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else {
            // Default: show next 30 days
            query += ` AND a.available_date >= date('now') AND a.available_date <= date('now', '+30 days')`;
        }
        
        query += ` ORDER BY a.available_date, a.start_time`;
        
        const slots = await dbAll(query, params);
        
        res.json({
            success: true,
            data: slots.map(slot => ({
                id: slot.id,
                nurseId: slot.nurse_id,
                date: slot.available_date,
                startTime: slot.start_time,
                endTime: slot.end_time,
                consultationType: slot.consultation_type,
                isBooked: slot.is_booked
            }))
        });
    } catch (error) {
        console.error('Get nurse availability error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch availability'
        });
    }
};

// Set nurse availability
const setNurseAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { availableDate, startTime, endTime, consultationType } = req.body;
        
        // Verify ownership
        if (req.user.role === 'nurse' && req.user.nurse_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to set availability for this nurse'
            });
        }
        
        // Check for existing slot
        const existing = await dbGet(
            `SELECT id FROM availability WHERE nurse_id = ? AND available_date = ? AND start_time = ?`,
            [id, availableDate, startTime]
        );
        
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'This time slot already exists'
            });
        }
        
        // Create availability slot
        await dbRun(
            `INSERT INTO availability (nurse_id, available_date, start_time, end_time, consultation_type)
             VALUES (?, ?, ?, ?, ?)`,
            [id, availableDate, startTime, endTime, consultationType || 'both']
        );
        
        // Get the last inserted ID
        const result = await dbGet('SELECT last_insert_rowid() as id');
        
        // Update profile completion
        await dbRun(
            `UPDATE nurses SET profile_completion = MIN(profile_completion + 15, 100) WHERE id = ?`,
            [id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Availability slot created',
            data: { slotId: result.id }
        });
    } catch (error) {
        console.error('Set nurse availability error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set availability'
        });
    }
};

module.exports = {
    getAllNurses,
    getNurseById,
    updateNurseProfile,
    uploadNursePhoto,
    getNurseAvailability,
    setNurseAvailability
};
