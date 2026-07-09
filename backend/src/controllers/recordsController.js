/**
 * Health Records Controller
 * Security-hardened version with nurse access control
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

// ============================================
// FIX 3: Nurse Access Control - Check booking relationship
// ============================================
const checkNurseAccess = async (req, patientId) => {
    if (req.user.role !== 'nurse') {
        return true; // Non-nurses pass through (patients use their own check)
    }
    
    // Get nurse_id for the logged-in user
    const nurse = await dbGet('SELECT id FROM nurses WHERE user_id = ?', [req.user.id]);
    if (!nurse) return false;
    
    // Check if nurse has an approved booking with this patient
    const booking = await dbGet(
        `SELECT id FROM bookings WHERE patient_id = ? AND nurse_id = ? AND status = 'confirmed' LIMIT 1`,
        [patientId, nurse.id]
    );
    
    return !!booking; // Return true only if booking exists
};

// Create a new health record
const createRecord = async (req, res) => {
    try {
        const { patientId, type, recordDate, data, notes } = req.body;
        
        // Validate required fields
        if (!patientId || !type || !recordDate) {
            return res.status(400).json({
                success: false,
                error: 'Patient ID, type, and record date are required'
            });
        }
        
        // Validate type
        const validTypes = ['vitals', 'lab_result', 'imaging', 'notes'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid record type. Must be one of: vitals, lab_result, imaging, notes'
            });
        }
        
        // Get nurse_id from user if applicable
        let nurseId = null;
        if (req.user.role === 'nurse') {
            const nurse = await dbGet('SELECT id FROM nurses WHERE user_id = ?', [req.user.id]);
            nurseId = nurse?.id;
        }
        
        // Handle file upload
        let fileUrl = null;
        if (req.file) {
            fileUrl = `/uploads/records/${req.file.filename}`;
        }
        
        // Insert the record
        const result = await dbRun(
            `INSERT INTO health_records (patient_id, nurse_id, type, record_date, data, file_url, notes, recorded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [patientId, nurseId, type, recordDate, JSON.stringify(data), fileUrl, notes, req.user.id]
        );
        
        // Log audit
        await logAudit(req.user.id, 'create', 'health_record', result.lastID, { patientId, type });
        
        res.status(201).json({
            success: true,
            message: 'Health record created successfully',
            data: {
                id: result.lastID,
                patientId,
                type,
                recordDate,
                fileUrl
            }
        });
    } catch (error) {
        console.error('Create record error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create health record'
        });
    }
};

// Get patient records with pagination and filtering
const getPatientRecords = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, startDate, endDate, page = 1, limit = 20 } = req.query;
        
        // Patients can only view their own records
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these records'
            });
        }
        
        // ============================================
        // FIX 3: Nurses can only view records for patients they've been consulted by
        // ============================================
        if (req.user.role === 'nurse') {
            const hasAccess = await checkNurseAccess(req, parseInt(id));
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view these records'
                });
            }
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE patient_id = ? AND deleted_at IS NULL';
        const params = [id];
        
        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
        }
        
        if (startDate) {
            whereClause += ' AND record_date >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            whereClause += ' AND record_date <= ?';
            params.push(endDate);
        }
        
        // Get total count
        const countResult = await dbGet(
            `SELECT COUNT(*) as total FROM health_records ${whereClause}`,
            params
        );
        
        // Get records
        const records = await dbAll(
            `SELECT * FROM health_records ${whereClause}
             ORDER BY record_date DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: {
                records: records.map(r => ({
                    id: r.id,
                    patientId: r.patient_id,
                    type: r.type,
                    recordDate: r.record_date,
                    data: r.data ? JSON.parse(r.data) : null,
                    fileUrl: r.file_url,
                    notes: r.notes,
                    createdAt: r.created_at
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get patient records error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch health records'
        });
    }
};

// Get single record
const getRecord = async (req, res) => {
    try {
        const { id } = req.params;
        
        const record = await dbGet(
            `SELECT * FROM health_records WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Health record not found'
            });
        }
        
        // Patients can only view their own records
        if (req.user.role === 'patient') {
            const patient = await dbGet('SELECT id FROM patients WHERE id = ?', [record.patient_id]);
            if (patient?.id !== req.user.patient_id) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this record'
                });
            }
        }
        
        // ============================================
        // FIX 3: Nurses can only view records for patients they've been consulted by
        // ============================================
        if (req.user.role === 'nurse') {
            const hasAccess = await checkNurseAccess(req, record.patient_id);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this record'
                });
            }
        }
        
        res.json({
            success: true,
            data: {
                id: record.id,
                patientId: record.patient_id,
                type: record.type,
                recordDate: record.record_date,
                data: record.data ? JSON.parse(record.data) : null,
                fileUrl: record.file_url,
                notes: record.notes,
                createdAt: record.created_at,
                updatedAt: record.updated_at
            }
        });
    } catch (error) {
        console.error('Get record error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch health record'
        });
    }
};

// Update record
const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, notes } = req.body;
        
        const record = await dbGet(
            `SELECT * FROM health_records WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Health record not found'
            });
        }
        
        // Build update query
        const updates = [];
        const params = [];
        
        if (data !== undefined) {
            updates.push('data = ?');
            params.push(JSON.stringify(data));
        }
        
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }
        
        if (req.file) {
            updates.push('file_url = ?');
            params.push(`/uploads/records/${req.file.filename}`);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        
        updates.push("updated_at = datetime('now')");
        params.push(id);
        
        await dbRun(
            `UPDATE health_records SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        // Log audit
        await logAudit(req.user.id, 'update', 'health_record', id);
        
        res.json({
            success: true,
            message: 'Health record updated successfully'
        });
    } catch (error) {
        console.error('Update record error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update health record'
        });
    }
};

// Delete record (soft delete)
const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        
        const record = await dbGet(
            `SELECT * FROM health_records WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Health record not found'
            });
        }
        
        await dbRun(
            `UPDATE health_records SET deleted_at = datetime('now') WHERE id = ?`,
            [id]
        );
        
        // Log audit
        await logAudit(req.user.id, 'delete', 'health_record', id);
        
        res.json({
            success: true,
            message: 'Health record deleted successfully'
        });
    } catch (error) {
        console.error('Delete record error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete health record'
        });
    }
};

// Get patient vitals
const getPatientVitals = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Patients can only view their own records
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these records'
            });
        }
        
        // ============================================
        // FIX 3: Nurses can only view records for patients they've been consulted by
        // ============================================
        if (req.user.role === 'nurse') {
            const hasAccess = await checkNurseAccess(req, parseInt(id));
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view these records'
                });
            }
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const records = await dbAll(
            `SELECT * FROM health_records 
             WHERE patient_id = ? AND type = 'vitals' AND deleted_at IS NULL
             ORDER BY record_date DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: records.map(r => ({
                id: r.id,
                recordDate: r.record_date,
                data: r.data ? JSON.parse(r.data) : null,
                notes: r.notes,
                createdAt: r.created_at
            }))
        });
    } catch (error) {
        console.error('Get patient vitals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vitals'
        });
    }
};

// Get patient lab results
const getPatientLabResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Patients can only view their own records
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these records'
            });
        }
        
        // ============================================
        // FIX 3: Nurses can only view records for patients they've been consulted by
        // ============================================
        if (req.user.role === 'nurse') {
            const hasAccess = await checkNurseAccess(req, parseInt(id));
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view these records'
                });
            }
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const records = await dbAll(
            `SELECT * FROM health_records 
             WHERE patient_id = ? AND type = 'lab_result' AND deleted_at IS NULL
             ORDER BY record_date DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: records.map(r => ({
                id: r.id,
                recordDate: r.record_date,
                data: r.data ? JSON.parse(r.data) : null,
                fileUrl: r.file_url,
                notes: r.notes,
                createdAt: r.created_at
            }))
        });
    } catch (error) {
        console.error('Get patient lab results error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lab results'
        });
    }
};

// Get patient trends for Recharts
const getPatientTrends = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        
        // Patients can only view their own records
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these records'
            });
        }
        
        // ============================================
        // FIX 3: Nurses can only view records for patients they've been consulted by
        // ============================================
        if (req.user.role === 'nurse') {
            const hasAccess = await checkNurseAccess(req, parseInt(id));
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view these records'
                });
            }
        }
        
        let whereClause = 'WHERE patient_id = ? AND deleted_at IS NULL';
        const params = [id];
        
        if (startDate) {
            whereClause += ' AND record_date >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            whereClause += ' AND record_date <= ?';
            params.push(endDate);
        }
        
        // Get all vitals and lab results
        const records = await dbAll(
            `SELECT * FROM health_records 
             ${whereClause} AND type IN ('vitals', 'lab_result')
             ORDER BY record_date ASC`,
            params
        );
        
        // Transform to trend data
        const trends = records.map(r => {
            const data = r.data ? JSON.parse(r.data) : {};
            return {
                date: r.record_date,
                systolic: data.systolic || null,
                diastolic: data.diastolic || null,
                weight: data.weight || null,
                egfr: data.egfr || null,
                creatinine: data.creatinine || null,
                potassium: data.potassium || null,
                type: r.type
            };
        });
        
        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Get patient trends error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trends'
        });
    }
};

module.exports = {
    createRecord,
    getPatientRecords,
    getRecord,
    updateRecord,
    deleteRecord,
    getPatientVitals,
    getPatientLabResults,
    getPatientTrends
};
