/**
 * AI Health Agent Controller
 * Security-hardened version
 */

const { db } = require('../models/database');
const { logAudit } = require('../middleware/auditLog');

// ============================================
// FIX 4: Input Sanitization for AI
// ============================================
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '').trim().slice(0, 2000);
};

// ============================================
// FIX 10: XSS Sanitization for AI Response
// ============================================
const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[&<>"']/g, (m) => ({
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#039;'
    })[m]);
};

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

// Escalation keywords that require nurse review
const ESCALATION_KEYWORDS = [
    'chest pain',
    'cannot urinate',
    'severe bleeding',
    'unconscious',
    'not breathing',
    'overdose',
    'trouble breathing',
    'difficulty breathing',
    'dialysis emergency',
    'severe chest pain',
    'can\'t breathe'
];

// System prompt for AI
const SYSTEM_PROMPT = `You are a kidney health assistant for Kidney Hub in South Africa. You help patients understand their kidney health, diet, medications, and lifestyle recommendations.

IMPORTANT GUIDELINES:
1. Always include this disclaimer: "This information is for educational purposes only. Always consult your nurse or doctor for medical advice."
2. Never diagnose. Always recommend professional medical consultation.
3. Focus on kidney health topics: CKD stages, diet recommendations, medications, dialysis, transplant, and general wellness.
4. Provide South Africa-specific context where relevant (NHSN protocols, South African healthcare system, local resources).
5. Be empathetic and supportive in your responses.
6. If symptoms seem serious, strongly encourage seeking immediate medical attention.
Remember: You are not a replacement for professional medical advice. Always defer to healthcare providers for medical decisions.`;

// Check if message contains escalation keywords
const containsEscalationKeywords = (message) => {
    const lowerMessage = message.toLowerCase();
    return ESCALATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
};

// ============================================
// FIX 2: Strip PHI from AI Context
// Get patient health context - MINIMAL version for AI
// ============================================
const getPatientContext = async (patientId) => {
    try {
        // Get patient info (minimal fields only)
        // Note: We do fetch name internally but strip it from the response
        const patient = await dbGet(
            `SELECT p.id, u.first_name, u.last_name 
             FROM patients p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [patientId]
        );
        
        if (!patient) return null;
        
        // Get latest vitals
        const latestVitals = await dbGet(
            `SELECT data, record_date FROM health_records 
             WHERE patient_id = ? AND type = 'vitals' AND deleted_at IS NULL
             ORDER BY record_date DESC LIMIT 1`,
            [patientId]
        );
        
        // Get latest lab results
        const latestLab = await dbGet(
            `SELECT data, record_date FROM health_records 
             WHERE patient_id = ? AND type = 'lab_result' AND deleted_at IS NULL
             ORDER BY record_date DESC LIMIT 1`,
            [patientId]
        );
        
        // Get assigned meal plan
        const mealPlanAssignment = await dbGet(
            `SELECT mp.name, mp.sodium_limit_mg, mp.potassium_limit_mg, mp.phosphorus_limit_mg, mp.protein_limit_g
             FROM meal_plan_assignments mpa
             JOIN meal_plans mp ON mpa.meal_plan_id = mp.id
             WHERE mpa.patient_id = ?
             ORDER BY mpa.assigned_at DESC LIMIT 1`,
            [patientId]
        );
        
        // Calculate eGFR stage
        let egfrStage = 'Unknown';
        if (latestLab && latestLab.data) {
            const data = JSON.parse(latestLab.data);
            if (data.egfr) {
                const egfr = parseFloat(data.egfr);
                if (egfr >= 90) egfrStage = 'Stage 1 (Normal)';
                else if (egfr >= 60) egfrStage = 'Stage 2 (Mild)';
                else if (egfr >= 45) egfrStage = 'Stage 3a (Moderate)';
                else if (egfr >= 30) egfrStage = 'Stage 3b (Moderate)';
                else if (egfr >= 15) egfrStage = 'Stage 4 (Severe)';
                else egfrStage = 'Stage 5 (Kidney Failure)';
            }
        }
        
        // Return ONLY what's needed for AI - NO PHI
        // Note: Names are fetched for potential logging but NOT included in response
        return {
            // NO patientName - stripped
            // NO dateOfBirth - stripped
            // NO gender - stripped
            // NO chronicConditions - stripped
            latestVitals: latestVitals ? {
                date: latestVitals.record_date,
                data: JSON.parse(latestVitals.data)
            } : null,
            latestLabResults: latestLab ? {
                date: latestLab.record_date,
                data: JSON.parse(latestLab.data)
            } : null,
            egfrStage,
            assignedMealPlan: mealPlanAssignment ? {
                name: mealPlanAssignment.name,
                sodiumLimitMg: mealPlanAssignment.sodium_limit_mg,
                potassiumLimitMg: mealPlanAssignment.potassium_limit_mg,
                phosphorusLimitMg: mealPlanAssignment.phosphorus_limit_mg,
                proteinLimitG: mealPlanAssignment.protein_limit_g
            } : null
        };
    } catch (error) {
        console.error('Get patient context error:', error);
        return null;
    }
};

// Chat with AI
const chat = async (req, res) => {
    try {
        let { message, patientId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        // ============================================
        // FIX 4: Sanitize user input before storing
        // ============================================
        const cleanMessage = sanitizeInput(message);
        
        // Get patient context (minimal - no PHI)
        const context = patientId ? await getPatientContext(patientId) : null;
        
        // Check for escalation keywords
        const needsEscalation = containsEscalationKeywords(cleanMessage);
        
        // Build context string for AI - MINIMAL, NO PHI
        let contextString = '';
        if (context) {
            contextString = `
            
PATIENT CONTEXT (health data only, no personal info):
- eGFR Stage: ${context.egfrStage}
- Latest Vitals (${context.latestVitals?.date}): Blood Pressure ${context.latestVitals?.data?.systolic}/${context.latestVitals?.data?.diastolic} mmHg, Weight: ${context.latestVitals?.data?.weight} kg
- Latest Lab Results (${context.latestLabResults?.date}): eGFR: ${context.latestLabResults?.data?.egfr}, Creatinine: ${context.latestLabResults?.data?.creatinine}, Potassium: ${context.latestLabResults?.data?.potassium}
${context.assignedMealPlan ? `- Current Diet Plan: ${context.assignedMealPlan.name} (Sodium: ${context.assignedMealPlan.sodiumLimitMg}mg, Potassium: ${context.assignedMealPlan.potassiumLimitMg}mg/day)` : ''}
`;
        }
        
        // In a real implementation, this would call OpenAI API
        // For now, we'll generate a response based on keywords
        let aiResponse = generateResponse(cleanMessage, context, needsEscalation);
        
        // ============================================
        // FIX 10: Escape HTML in AI response before sending
        // ============================================
        const safeResponse = escapeHtml(aiResponse);
        
        // Store conversation with sanitized message
        let conversationId;
        if (patientId) {
            // Get or create conversation
            let conversation = await dbGet(
                'SELECT id FROM ai_conversations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
                [patientId]
            );
            
            if (conversation) {
                // Update existing conversation
                const existingMessages = await dbGet(
                    'SELECT messages FROM ai_conversations WHERE id = ?',
                    [conversation.id]
                );
                const messages = existingMessages?.messages ? JSON.parse(existingMessages.messages) : [];
                messages.push({ role: 'user', content: cleanMessage });
                messages.push({ role: 'assistant', content: aiResponse });
                
                await dbRun(
                    'UPDATE ai_conversations SET messages = ?, flagged = ? WHERE id = ?',
                    [JSON.stringify(messages), needsEscalation ? 1 : 0, conversation.id]
                );
                conversationId = conversation.id;
            } else {
                // Create new conversation
                const messages = [
                    { role: 'user', content: cleanMessage },
                    { role: 'assistant', content: aiResponse }
                ];
                const result = await dbRun(
                    'INSERT INTO ai_conversations (patient_id, messages, flagged) VALUES (?, ?, ?)',
                    [patientId, JSON.stringify(messages), needsEscalation ? 1 : 0]
                );
                conversationId = result.lastID;
            }
        }
        
        res.json({
            success: true,
            data: {
                response: safeResponse,
                needsEscalation,
                conversationId,
                context: context ? {
                    egfrStage: context.egfrStage,
                    hasMealPlan: !!context.assignedMealPlan
                } : null
            }
        });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
};

// Generate AI response (placeholder for OpenAI integration)
const generateResponse = (message, context, needsEscalation) => {
    const lowerMessage = message.toLowerCase();
    
    // Handle escalation
    if (needsEscalation) {
        return `I notice you mentioned symptoms that could indicate a serious medical situation. 

⚠️ **Please seek immediate medical attention** if you are experiencing:
- Chest pain or pressure
- Difficulty breathing
- Severe bleeding
- Unable to urinate
- Loss of consciousness

**In South Africa, for emergencies:**
- Call 10177 (Netcare 911)
- Call 082 911 (ER24)
- Go to your nearest emergency department

For non-emergency advice, please contact your Kidney Hub nurse through the app.
---
This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
    }
    
    // Handle diet questions
    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        if (context?.assignedMealPlan) {
            return `Great question about diet! Based on your ${context.egfrStage} status, here are some general kidney-friendly eating tips:

**Daily Limits to Remember:**
- Sodium: ${context.assignedMealPlan.sodiumLimitMg}mg or less
- Potassium: ${context.assignedMealPlan.potassiumLimitMg}mg
- Phosphorus: ${context.assignedMealPlan.phosphorusLimitMg}mg

**Kidney-Friendly Food Choices:**
1. **Choose fresh foods** over processed or canned
2. **Limit salt** - use herbs and spices instead
3. **Watch your potassium** - avoid banana, oranges, potatoes (unless leached)
4. **Control portions** - especially protein-rich foods

**South African Tips:**
- Try using Mrs. Pastures or other low-sodium seasonings
- Fresh Muttonhead soup (without salt) can be nutritious
- Red beans and rice (rinsed well) make good protein sources

Your assigned meal plan "${context.assignedMealPlan.name}" provides detailed daily menus. Would you like tips on a specific meal or snack idea?

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
        }
        return `Here's a general guide to kidney-friendly eating:

**Key Principles:**
1. **Control sodium** - Aim for less than 2,300mg daily
2. **Watch potassium** - Choose low-potassium foods
3. **Limit phosphorus** - Avoid processed foods with phosphate additives
4. **Manage protein** - Work with your nurse to determine your needs
**Foods to Enjoy:**
- Apples, berries, grapes
- Cauliflower, onions, peppers
- Chicken, fish (in moderation)
- Rice, pasta, bread

**Foods to Limit:**
- Bananas, oranges, potatoes
- Processed meats
- Canned soups and vegetables
- Dark sodas

Would you like more specific advice based on your kidney stage?

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
    }
    
    // Handle medication questions
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('pill')) {
        return `Important reminder about medications and kidney health:

**General Guidelines:**
1. **Never skip doses** of prescribed kidney medications
2. **Avoid NSAIDs** like ibuprofen and naproxen - they can harm kidneys
3. **Tell all doctors** about your kidney condition
4. **Check labels** for sodium content in antacids

**Common Kidney Medications:**
- **Phosphate binders** - Help control phosphorus
- **ACE inhibitors/ARBs** - Protect kidney function
- **Diuretics** - Help remove excess fluid
- **Erythropoietin** - Treat anemia (if prescribed)

**South African Resources:**
- Your chronic medication can be collected at Dis-Chem, Clicks, or Medipost
- Ask your nurse about the CDL (Chronic Dispencing List) for easier refills

Always consult your nurse or doctor before starting any new medication, including over-the-counter drugs.

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
    }
    
    // Handle dialysis questions
    if (lowerMessage.includes('dialysis')) {
        return `Here's information about dialysis for kidney patients in South Africa:

**Types of Dialysis:**

**1. Haemodialysis (HD)**
- Done at a dialysis centre, usually 3 times/week
- Each session takes 3-4 hours
- NHSN and government facilities offer subsidized dialysis
- You'll need vascular access (fistula or graft)
**2. Peritoneal Dialysis (PD)**
- Done at home, daily
- More flexible for work and travel
- Requires sterile technique training
- Dialysis fluid exchanges through a catheter

**Preparing for Dialysis:**
- Discuss access options with your nephrologist
- Ask about Medicare/medical aid coverage
- Consider travel implications
- Join a support group (Kidney CAN offers support)

**South African Dialysis Units:**
- National Renal Care (NRC)
- Netcare Dialysis
- Government provincial hospitals

Questions about what to expect during dialysis?

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
    }
    
    // Handle general greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return `Hello! Welcome to Kidney Hub's AI Health Assistant.

I'm here to help you understand your kidney health better. I can answer questions about:
- Diet and nutrition for kidney health
- Understanding your lab results
- Medications and supplements
- Lifestyle tips
- Preparing for appointments

${context ? `I can see you're on the **${context.egfrStage}** stage. ` : ''}How can I help you today?

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
    }
    
    // Default response
    return `Thank you for your question! I'm here to help with kidney health information.

Based on your query, here are some general thoughts:

**Things to Consider:**
- Keep track of your symptoms and when they occur
- Note any changes in your urine output or appearance
- Monitor your blood pressure regularly
- Attend all scheduled appointments and lab tests

**When to Contact Your Nurse:**
- New swelling in hands, feet, or face
- Significant weight changes
- Changes in urine color or amount
- New or worsening fatigue

**Resources Available:**
- Your assigned meal plan (check the Meal Plans section)
- Education articles (check the Education Hub)
- Book appointments with your nurse through the app

Is there a specific topic you'd like to know more about?

This information is for educational purposes only. Always consult your nurse or doctor for medical advice.`;
};

// Get patient health context for AI (nurse view - shows more info)
const getContext = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const context = await getPatientContext(patientId);
        
        if (!context) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        
        res.json({
            success: true,
            data: context
        });
    } catch (error) {
        console.error('Get context error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch patient context'
        });
    }
};

// Submit feedback
const submitFeedback = async (req, res) => {
    try {
        const { conversationId, patientId, rating } = req.body;
        
        if (!conversationId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Conversation ID and rating are required'
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }
        
        const result = await dbRun(
            'INSERT INTO ai_feedback (conversation_id, patient_id, rating) VALUES (?, ?, ?)',
            [conversationId, patientId, rating]
        );
        
        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
};

// ============================================
// FIX 11: AI Conversation Access Control
// ============================================
const getConversation = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Get the patient record for the requesting user
        let requestingPatientId = null;
        if (req.user.role === 'patient') {
            const patient = await dbGet('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            requestingPatientId = patient?.id;
        }
        
        // Patients can only access their own conversations
        if (req.user.role === 'patient' && requestingPatientId !== parseInt(patientId)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this conversation'
            });
        }
        
        // Verify the conversation belongs to the requesting patient
        const conversation = await dbGet(
            'SELECT * FROM ai_conversations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
            [patientId]
        );
        
        if (!conversation) {
            return res.json({
                success: true,
                data: {
                    messages: []
                }
            });
        }
        
        res.json({
            success: true,
            data: {
                id: conversation.id,
                messages: conversation.messages ? JSON.parse(conversation.messages) : [],
                flagged: conversation.flagged,
                createdAt: conversation.created_at
            }
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversation'
        });
    }
};

// Get flagged warnings for nurse review
const getWarnings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const warnings = await dbAll(
            `SELECT ac.*, u.first_name, u.last_name, u.email
             FROM ai_conversations ac
             JOIN patients p ON ac.patient_id = p.id
             JOIN users u ON p.user_id = u.id
             WHERE ac.flagged = 1
             ORDER BY ac.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: warnings.map(w => ({
                id: w.id,
                patientId: w.patient_id,
                patientName: `${w.first_name} ${w.last_name}`,
                patientEmail: w.email,
                messages: w.messages ? JSON.parse(w.messages) : [],
                createdAt: w.created_at
            }))
        });
    } catch (error) {
        console.error('Get warnings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch warnings'
        });
    }
};

module.exports = {
    chat,
    getContext,
    submitFeedback,
    getConversation,
    getWarnings
};
