/**
 * Indemnity Controller
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

// Get indemnity form content
const getIndemnityForm = async (req, res) => {
    try {
        const { formType } = req.query;
        const type = formType || (req.user.role === 'nurse' ? 'nurse' : 'patient');
        
        // Return appropriate form based on type
        const forms = {
            patient: {
                type: 'patient',
                title: 'Patient Indemnity and Consent Form',
                content: `
                    <h2>1. Acknowledgment of Risks</h2>
                    <p>I understand that nursing consultations involve inherent risks, and I acknowledge that I have been informed of the nature and possible risks of the proposed treatment/care.</p>
                    
                    <h2>2. Consent to Treatment</h2>
                    <p>I hereby consent to receive nursing care and consultations as recommended by the verified nurse(s) on this platform. I understand that I have the right to refuse any treatment at any time.</p>
                    
                    <h2>3. Data Protection Consent</h2>
                    <p>I consent to the collection, storage, and processing of my personal and medical information for the purpose of providing healthcare services. My data will be handled in accordance with applicable data protection laws.</p>
                    
                    <h2>4. Emergency Contact</h2>
                    <p>I agree to provide accurate emergency contact information and understand that this may be used in case of a medical emergency.</p>
                    
                    <h2>5. Medical History Disclosure</h2>
                    <p>I confirm that I have disclosed all relevant medical conditions, allergies, and current medications to the best of my knowledge.</p>
                    
                    <h2>Terms and Conditions</h2>
                    <p>By signing this form, I acknowledge that I have read, understood, and agree to the above terms and conditions.</p>
                `,
                lastUpdated: '2024-01-15'
            },
            nurse: {
                type: 'nurse',
                title: 'Nurse Professional Indemnity and Agreement Form',
                content: `
                    <h2>1. Professional Liability Acknowledgment</h2>
                    <p>I acknowledge that I am solely responsible for my professional actions and decisions made during consultations. I maintain current professional liability insurance.</p>
                    
                    <h2>2. Scope of Practice Agreement</h2>
                    <p>I agree to practice only within my scope of competence and qualification as registered with SANC. I will not provide services beyond my scope of practice.</p>
                    
                    <h2>3. Infection Control Compliance</h2>
                    <p>I commit to following all infection control protocols and guidelines, including proper hand hygiene, use of personal protective equipment, and safe disposal of medical waste.</p>
                    
                    <h2>4. Patient Confidentiality Agreement</h2>
                    <p>I agree to maintain strict confidentiality of all patient information. I will not disclose any patient information except as required by law or for direct patient care.</p>
                    
                    <h2>5. Incident Reporting Commitment</h2>
                    <p>I commit to promptly reporting any adverse events, near-misses, or safety concerns through the appropriate channels.</p>
                    
                    <h2>6. Continuing Professional Development</h2>
                    <p>I agree to maintain my professional competence through ongoing education and professional development activities.</p>
                    
                    <h2>Terms and Conditions</h2>
                    <p>By signing this form, I acknowledge that I have read, understood, and agree to the above terms and conditions.</p>
                `,
                lastUpdated: '2024-01-15'
            }
        };
        
        res.json({
            success: true,
            data: forms[type] || forms.patient
        });
    } catch (error) {
        console.error('Get indemnity form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get indemnity form'
        });
    }
};

// Sign indemnity form
const signIndemnityForm = async (req, res) => {
    try {
        const { formType, signatureData } = req.body;
        
        // Check if already signed
        const existing = await dbGet(
            `SELECT id FROM indemnity_forms WHERE user_id = ? AND form_type = ? AND is_valid = 1`,
            [req.user.id, formType]
        );
        
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Indemnity form already signed'
            });
        }
        
        // Record signature
        await dbRun(
            `INSERT INTO indemnity_forms (user_id, form_type, ip_address, user_agent, signature_data)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, formType, req.ip, req.get('User-Agent'), signatureData || 'Digital Signature']
        );
        
        // Get the last inserted ID
        const result = await dbGet('SELECT last_insert_rowid() as id');
        
        // Log audit
        await logAudit(req.user.id, 'SIGN_INDEMNITY', 'indemnity_forms', result.id, { formType }, req);
        
        res.status(201).json({
            success: true,
            message: 'Indemnity form signed successfully',
            data: {
                signatureId: result.id,
                signedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Sign indemnity form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sign indemnity form'
        });
    }
};

// Check indemnity status
const getIndemnityStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const forms = await dbAll(
            `SELECT * FROM indemnity_forms WHERE user_id = ? AND is_valid = 1`,
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                userId: parseInt(userId),
                patientFormSigned: forms.some(f => f.form_type === 'patient'),
                nurseFormSigned: forms.some(f => f.form_type === 'nurse'),
                signatures: forms.map(f => ({
                    id: f.id,
                    formType: f.form_type,
                    signedAt: f.signed_at
                }))
            }
        });
    } catch (error) {
        console.error('Get indemnity status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get indemnity status'
        });
    }
};

module.exports = {
    getIndemnityForm,
    signIndemnityForm,
    getIndemnityStatus
};
