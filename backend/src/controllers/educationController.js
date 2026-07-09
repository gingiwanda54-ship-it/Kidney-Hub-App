/**
 * Education Hub Controller
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

// Get all education content
const getAllContent = async (req, res) => {
    try {
        const { category, type, kidneyStage, page = 1, limit = 20 } = req.query;
        
        let whereClause = '';
        const params = [];
        
        if (category) {
            whereClause = 'WHERE category = ?';
            params.push(category);
        }
        
        if (type) {
            whereClause += whereClause ? ' AND type = ?' : 'WHERE type = ?';
            params.push(type);
        }
        
        if (kidneyStage) {
            whereClause += whereClause ? ' AND kidney_stage_relevance LIKE ?' : 'WHERE kidney_stage_relevance LIKE ?';
            params.push(`%${kidneyStage}%`);
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count
        const countResult = await dbGet(
            `SELECT COUNT(*) as total FROM education_content ${whereClause}`,
            params
        );
        
        // Get content
        const content = await dbAll(
            `SELECT * FROM education_content ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: {
                content: content.map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    type: c.type,
                    summary: c.summary,
                    kidneyStageRelevance: c.kidney_stage_relevance,
                    readTimeMinutes: c.read_time_minutes,
                    videoUrl: c.video_url,
                    createdAt: c.created_at
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
        console.error('Get all content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch education content'
        });
    }
};

// Get single content item
const getContent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const content = await dbGet(
            'SELECT * FROM education_content WHERE id = ?',
            [id]
        );
        
        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: content.id,
                title: content.title,
                category: content.category,
                type: content.type,
                body: content.body,
                summary: content.summary,
                kidneyStageRelevance: content.kidney_stage_relevance,
                readTimeMinutes: content.read_time_minutes,
                videoUrl: content.video_url,
                createdAt: content.created_at
            }
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch content'
        });
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const categories = await dbAll(
            `SELECT DISTINCT category, type, COUNT(*) as count 
             FROM education_content 
             GROUP BY category, type`
        );
        
        res.json({
            success: true,
            data: categories.map(c => ({
                category: c.category,
                type: c.type,
                count: c.count
            }))
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
};

// Get featured content based on patient eGFR stage
const getFeatured = async (req, res) => {
    try {
        const { patientId } = req.query;
        
        let kidneyStage = 'all';
        
        if (patientId) {
            // Get patient's latest eGFR
            const latestRecord = await dbGet(
                `SELECT data FROM health_records 
                 WHERE patient_id = ? AND type = 'lab_result' AND deleted_at IS NULL
                 ORDER BY record_date DESC
                 LIMIT 1`,
                [patientId]
            );
            
            if (latestRecord && latestRecord.data) {
                const data = JSON.parse(latestRecord.data);
                if (data.egfr) {
                    const egfr = parseFloat(data.egfr);
                    if (egfr >= 90) kidneyStage = 'stage1';
                    else if (egfr >= 60) kidneyStage = 'stage2';
                    else if (egfr >= 45) kidneyStage = 'stage3';
                    else if (egfr >= 30) kidneyStage = 'stage4';
                    else kidneyStage = 'stage5';
                }
            }
        }
        
        // Get featured content
        let content;
        if (kidneyStage === 'all') {
            content = await dbAll(
                `SELECT * FROM education_content 
                 ORDER BY created_at DESC 
                 LIMIT 5`
            );
        } else {
            content = await dbAll(
                `SELECT * FROM education_content 
                 WHERE kidney_stage_relevance LIKE ? OR kidney_stage_relevance LIKE '%all%'
                 ORDER BY created_at DESC 
                 LIMIT 5`,
                [`%${kidneyStage}%`]
            );
        }
        
        res.json({
            success: true,
            data: {
                patientStage: kidneyStage,
                content: content.map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    type: c.type,
                    summary: c.summary,
                    readTimeMinutes: c.read_time_minutes
                }))
            }
        });
    } catch (error) {
        console.error('Get featured error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured content'
        });
    }
};

// Create education content
const createContent = async (req, res) => {
    try {
        const { title, category, type, body, summary, kidneyStageRelevance, readTimeMinutes, videoUrl } = req.body;
        
        if (!title || !category || !type) {
            return res.status(400).json({
                success: false,
                error: 'Title, category, and type are required'
            });
        }
        
        const result = await dbRun(
            `INSERT INTO education_content (title, category, type, body, summary, kidney_stage_relevance, read_time_minutes, video_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, category, type, body, summary, kidneyStageRelevance, readTimeMinutes || 5, videoUrl]
        );
        
        // Log audit
        await logAudit(req.user.id, 'create', 'education_content', result.lastID, { title, category });
        
        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Create content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create content'
        });
    }
};

// Search content
const searchContent = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const searchTerm = `%${q}%`;
        
        // Search in title, body, and summary
        const content = await dbAll(
            `SELECT * FROM education_content 
             WHERE (title LIKE ? OR body LIKE ? OR summary LIKE ?)
             ORDER BY 
                CASE WHEN title LIKE ? THEN 0 ELSE 1 END,
                created_at DESC
             LIMIT ? OFFSET ?`,
            [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: content.map(c => ({
                id: c.id,
                title: c.title,
                category: c.category,
                type: c.type,
                summary: c.summary,
                readTimeMinutes: c.read_time_minutes
            }))
        });
    } catch (error) {
        console.error('Search content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search content'
        });
    }
};

// Get patient progress
const getPatientProgress = async (req, res) => {
    try {
        const { id } = req.params;
        
        const progress = await dbAll(
            `SELECT ep.*, ec.title, ec.category, ec.type, ec.read_time_minutes
             FROM education_progress ep
             JOIN education_content ec ON ep.content_id = ec.id
             WHERE ep.patient_id = ?
             ORDER BY ep.completed_at DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: progress.map(p => ({
                id: p.id,
                contentId: p.content_id,
                title: p.title,
                category: p.category,
                type: p.type,
                status: p.status,
                readTimeMinutes: p.read_time_minutes,
                completedAt: p.completed_at
            }))
        });
    } catch (error) {
        console.error('Get patient progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patient progress'
        });
    }
};

// Mark progress
const markProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { contentId, status } = req.body;
        
        if (!contentId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Content ID and status are required'
            });
        }
        
        const validStatuses = ['not_started', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be not_started, in_progress, or completed'
            });
        }
        
        // Check if progress record exists
        const existing = await dbGet(
            'SELECT id FROM education_progress WHERE patient_id = ? AND content_id = ?',
            [id, contentId]
        );
        
        let result;
        if (existing) {
            // Update existing
            const completedAt = status === 'completed' ? new Date().toISOString() : null;
            await dbRun(
                'UPDATE education_progress SET status = ?, completed_at = ? WHERE patient_id = ? AND content_id = ?',
                [status, completedAt, id, contentId]
            );
            result = { lastID: existing.id };
        } else {
            // Create new
            const completedAt = status === 'completed' ? new Date().toISOString() : null;
            result = await dbRun(
                'INSERT INTO education_progress (patient_id, content_id, status, completed_at) VALUES (?, ?, ?, ?)',
                [id, contentId, status, completedAt]
            );
        }
        
        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Mark progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update progress'
        });
    }
};

module.exports = {
    getAllContent,
    getContent,
    getCategories,
    getFeatured,
    createContent,
    searchContent,
    getPatientProgress,
    markProgress
};
