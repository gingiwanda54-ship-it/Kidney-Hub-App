/**
 * Meal Plans Controller
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

// Get all meal plans
const getAllMealPlans = async (req, res) => {
    try {
        const { kidneyStage, page = 1, limit = 20 } = req.query;
        
        let whereClause = '';
        const params = [];
        
        if (kidneyStage) {
            whereClause = 'WHERE kidney_stage = ?';
            params.push(kidneyStage);
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count
        const countResult = await dbGet(
            `SELECT COUNT(*) as total FROM meal_plans ${whereClause}`,
            params
        );
        
        // Get meal plans
        const mealPlans = await dbAll(
            `SELECT * FROM meal_plans ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: {
                mealPlans: mealPlans.map(mp => ({
                    id: mp.id,
                    name: mp.name,
                    description: mp.description,
                    kidneyStage: mp.kidney_stage,
                    caloriesPerDay: mp.calories_per_day,
                    sodiumLimitMg: mp.sodium_limit_mg,
                    potassiumLimitMg: mp.potassium_limit_mg,
                    phosphorusLimitMg: mp.phosphorus_limit_mg,
                    proteinLimitG: mp.protein_limit_g,
                    createdAt: mp.created_at
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
        console.error('Get all meal plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meal plans'
        });
    }
};

// Get single meal plan with days and meals
const getMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const mealPlan = await dbGet(
            'SELECT * FROM meal_plans WHERE id = ?',
            [id]
        );
        
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                error: 'Meal plan not found'
            });
        }
        
        // Get days with meals
        const days = await dbAll(
            `SELECT * FROM meal_plan_days 
             WHERE meal_plan_id = ? 
             ORDER BY day_number ASC`,
            [id]
        );
        
        // Get meals for each day
        for (const day of days) {
            const meals = await dbAll(
                `SELECT * FROM meal_plan_meals 
                 WHERE meal_plan_day_id = ? 
                 ORDER BY 
                    CASE type 
                        WHEN 'breakfast' THEN 1 
                        WHEN 'lunch' THEN 2 
                        WHEN 'dinner' THEN 3 
                        WHEN 'snack' THEN 4 
                    END`,
                [day.id]
            );
            day.meals = meals.map(m => ({
                id: m.id,
                type: m.type,
                name: m.name,
                ingredients: m.ingredients,
                instructions: m.instructions,
                imageUrl: m.image_url,
                calories: m.calories,
                sodiumMg: m.sodium_mg,
                potassiumMg: m.potassium_mg
            }));
        }
        
        res.json({
            success: true,
            data: {
                id: mealPlan.id,
                name: mealPlan.name,
                description: mealPlan.description,
                kidneyStage: mealPlan.kidney_stage,
                caloriesPerDay: mealPlan.calories_per_day,
                sodiumLimitMg: mealPlan.sodium_limit_mg,
                potassiumLimitMg: mealPlan.potassium_limit_mg,
                phosphorusLimitMg: mealPlan.phosphorus_limit_mg,
                proteinLimitG: mealPlan.protein_limit_g,
                createdAt: mealPlan.created_at,
                days: days.map(d => ({
                    id: d.id,
                    dayNumber: d.day_number,
                    meals: d.meals
                }))
            }
        });
    } catch (error) {
        console.error('Get meal plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meal plan'
        });
    }
};

// Create a new meal plan
const createMealPlan = async (req, res) => {
    try {
        const { name, description, kidneyStage, caloriesPerDay, sodiumLimitMg, potassiumLimitMg, phosphorusLimitMg, proteinLimitG, days } = req.body;
        
        if (!name || !kidneyStage) {
            return res.status(400).json({
                success: false,
                error: 'Name and kidney stage are required'
            });
        }
        
        // Insert meal plan
        const result = await dbRun(
            `INSERT INTO meal_plans (name, description, kidney_stage, calories_per_day, sodium_limit_mg, potassium_limit_mg, phosphorus_limit_mg, protein_limit_g)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, kidneyStage, caloriesPerDay || 2000, sodiumLimitMg || 2000, potassiumLimitMg || 3000, phosphorusLimitMg || 1000, proteinLimitG || 75]
        );
        
        const mealPlanId = result.lastID;
        
        // Insert days and meals if provided
        if (days && Array.isArray(days)) {
            for (const dayData of days) {
                const dayResult = await dbRun(
                    `INSERT INTO meal_plan_days (meal_plan_id, day_number) VALUES (?, ?)`,
                    [mealPlanId, dayData.dayNumber]
                );
                
                const dayId = dayResult.lastID;
                
                if (dayData.meals && Array.isArray(dayData.meals)) {
                    for (const meal of dayData.meals) {
                        await dbRun(
                            `INSERT INTO meal_plan_meals (meal_plan_day_id, type, name, ingredients, instructions, image_url, calories, sodium_mg, potassium_mg)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [dayId, meal.type, meal.name, meal.ingredients, meal.instructions, meal.imageUrl, meal.calories || 0, meal.sodiumMg || 0, meal.potassiumMg || 0]
                        );
                    }
                }
            }
        }
        
        // Log audit
        await logAudit(req.user.id, 'create', 'meal_plan', mealPlanId, { name, kidneyStage });
        
        res.status(201).json({
            success: true,
            message: 'Meal plan created successfully',
            data: { id: mealPlanId }
        });
    } catch (error) {
        console.error('Create meal plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create meal plan'
        });
    }
};

// Get recommended meal plan based on patient eGFR
const getRecommendedMealPlan = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Get patient's latest eGFR from health records
        const latestRecord = await dbGet(
            `SELECT data FROM health_records 
             WHERE patient_id = ? AND type = 'lab_result' AND deleted_at IS NULL
             ORDER BY record_date DESC
             LIMIT 1`,
            [patientId]
        );
        
        let kidneyStage = 'general';
        
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
        
        // Map eGFR stage to meal plan stage
        const stageMapping = {
            'stage1': 'stage1_2',
            'stage2': 'stage1_2',
            'stage3': 'stage3_4',
            'stage4': 'stage3_4',
            'stage5': 'stage5_dialysis'
        };
        
        const mealPlanStage = stageMapping[kidneyStage] || 'general_prevention';
        
        // Find meal plan for this stage
        let mealPlan = await dbGet(
            `SELECT * FROM meal_plans WHERE kidney_stage = ? LIMIT 1`,
            [mealPlanStage]
        );
        
        // Fallback to general if no specific plan found
        if (!mealPlan) {
            mealPlan = await dbGet(
                `SELECT * FROM meal_plans WHERE kidney_stage = 'general_prevention' LIMIT 1`
            );
        }
        
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                error: 'No meal plan found for your kidney stage'
            });
        }
        
        // Get days with meals
        const days = await dbAll(
            `SELECT * FROM meal_plan_days WHERE meal_plan_id = ? ORDER BY day_number ASC`,
            [mealPlan.id]
        );
        
        for (const day of days) {
            const meals = await dbAll(
                `SELECT * FROM meal_plan_meals WHERE meal_plan_day_id = ? ORDER BY id`,
                [day.id]
            );
            day.meals = meals.map(m => ({
                id: m.id,
                type: m.type,
                name: m.name,
                ingredients: m.ingredients,
                instructions: m.instructions,
                calories: m.calories,
                sodiumMg: m.sodium_mg,
                potassiumMg: m.potassium_mg
            }));
        }
        
        res.json({
            success: true,
            data: {
                id: mealPlan.id,
                name: mealPlan.name,
                description: mealPlan.description,
                kidneyStage: mealPlan.kidney_stage,
                egfrStage: kidneyStage,
                sodiumLimitMg: mealPlan.sodium_limit_mg,
                potassiumLimitMg: mealPlan.potassium_limit_mg,
                phosphorusLimitMg: mealPlan.phosphorus_limit_mg,
                proteinLimitG: mealPlan.protein_limit_g,
                days: days.map(d => ({
                    dayNumber: d.day_number,
                    meals: d.meals
                }))
            }
        });
    } catch (error) {
        console.error('Get recommended meal plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recommended meal plan'
        });
    }
};

// Get all meal plan assignments
const getAssignments = async (req, res) => {
    try {
        const { patientId } = req.query;
        
        let whereClause = '';
        const params = [];
        
        if (patientId) {
            whereClause = 'WHERE mpa.patient_id = ?';
            params.push(patientId);
        }
        
        const assignments = await dbAll(
            `SELECT mpa.*, mp.name as meal_plan_name, mp.kidney_stage,
                    u.first_name as assigned_by_first_name, u.last_name as assigned_by_last_name
             FROM meal_plan_assignments mpa
             JOIN meal_plans mp ON mpa.meal_plan_id = mp.id
             LEFT JOIN nurses n ON mpa.assigned_by = n.id
             LEFT JOIN users u ON n.user_id = u.id
             ${whereClause}
             ORDER BY mpa.assigned_at DESC`,
            params
        );
        
        res.json({
            success: true,
            data: assignments.map(a => ({
                id: a.id,
                patientId: a.patient_id,
                mealPlanId: a.meal_plan_id,
                mealPlanName: a.meal_plan_name,
                kidneyStage: a.kidney_stage,
                assignedBy: a.assigned_by_first_name ? `${a.assigned_by_first_name} ${a.assigned_by_last_name}` : null,
                assignedAt: a.assigned_at
            }))
        });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch assignments'
        });
    }
};

// Assign meal plan to patient
const assignMealPlan = async (req, res) => {
    try {
        const { patientId, mealPlanId } = req.body;
        
        if (!patientId || !mealPlanId) {
            return res.status(400).json({
                success: false,
                error: 'Patient ID and meal plan ID are required'
            });
        }
        
        // Verify meal plan exists
        const mealPlan = await dbGet('SELECT id FROM meal_plans WHERE id = ?', [mealPlanId]);
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                error: 'Meal plan not found'
            });
        }
        
        // Get nurse_id if admin/nurse
        let assignedBy = null;
        if (req.user.role === 'nurse' || req.user.role === 'admin') {
            const nurse = await dbGet('SELECT id FROM nurses WHERE user_id = ?', [req.user.id]);
            assignedBy = nurse?.id;
        }
        
        // Check if already assigned
        const existing = await dbGet(
            'SELECT id FROM meal_plan_assignments WHERE patient_id = ? AND meal_plan_id = ?',
            [patientId, mealPlanId]
        );
        
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Meal plan already assigned to this patient'
            });
        }
        
        const result = await dbRun(
            `INSERT INTO meal_plan_assignments (patient_id, meal_plan_id, assigned_by) VALUES (?, ?, ?)`,
            [patientId, mealPlanId, assignedBy]
        );
        
        // Log audit
        await logAudit(req.user.id, 'assign', 'meal_plan', result.lastID, { patientId, mealPlanId });
        
        res.status(201).json({
            success: true,
            message: 'Meal plan assigned successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Assign meal plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign meal plan'
        });
    }
};

// Generate grocery list from meal plan
const generateGroceryList = async (req, res) => {
    try {
        const { id } = req.params;
        
        const mealPlan = await dbGet('SELECT * FROM meal_plans WHERE id = ?', [id]);
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                error: 'Meal plan not found'
            });
        }
        
        // Get all meals
        const meals = await dbAll(
            `SELECT mpm.* FROM meal_plan_meals mpm
             JOIN meal_plan_days mpd ON mpm.meal_plan_day_id = mpd.id
             WHERE mpd.meal_plan_id = ?`,
            [id]
        );
        
        // Aggregate ingredients
        const ingredientMap = new Map();
        
        for (const meal of meals) {
            if (meal.ingredients) {
                const ingredients = meal.ingredients.split('\n').map(i => i.trim()).filter(i => i);
                
                for (const ingredient of ingredients) {
                    // Simple parsing: "200g chicken breast"
                    const match = ingredient.match(/^([\d.]+)\s*(g|kg|ml|L|cup|tbsp|tsp|oz|lb)?\s*(.+)$/i);
                    if (match) {
                        const [, amount, unit, name] = match;
                        const key = name.toLowerCase().trim();
                        
                        if (ingredientMap.has(key)) {
                            const existing = ingredientMap.get(key);
                            existing.amount += parseFloat(amount);
                        } else {
                            ingredientMap.set(key, {
                                name: name.trim(),
                                amount: parseFloat(amount),
                                unit: unit || 'g'
                            });
                        }
                    } else {
                        // No amount specified
                        if (!ingredientMap.has(ingredient.toLowerCase())) {
                            ingredientMap.set(ingredient.toLowerCase(), {
                                name: ingredient,
                                amount: 1,
                                unit: 'item'
                            });
                        }
                    }
                }
            }
        }
        
        // Convert to array and sort by category
        const groceryList = Array.from(ingredientMap.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => ({
                item: item.name,
                quantity: item.amount,
                unit: item.unit
            }));
        
        res.json({
            success: true,
            data: {
                mealPlanId: id,
                mealPlanName: mealPlan.name,
                groceryList
            }
        });
    } catch (error) {
        console.error('Generate grocery list error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate grocery list'
        });
    }
};

module.exports = {
    getAllMealPlans,
    getMealPlan,
    createMealPlan,
    getRecommendedMealPlan,
    getAssignments,
    assignMealPlan,
    generateGroceryList
};
