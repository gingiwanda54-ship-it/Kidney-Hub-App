/**
 * Seed Meal Plans Database
 * Usage: node database/seed-meal-plans.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/kidney_hub.db';

async function seedMealPlans() {
    const SQL = await initSqlJs();
    let db;
    
    try {
        // Load existing database
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } else {
            console.error('Database not found. Please run the server first to create the database.');
            process.exit(1);
        }
        
        // Clear existing meal plans
        db.run('DELETE FROM meal_plan_meals');
        db.run('DELETE FROM meal_plan_days');
        db.run('DELETE FROM meal_plan_assignments');
        db.run('DELETE FROM meal_plans');
        console.log('Cleared existing meal plans');
        
        // Define meal plans
        const plans = [
            ['Early Stage Kidney Care', 'Balanced diet for Stage 1-2 CKD', 'stage1_2', 2000, 2000, 2000, 1000, 75],
            ['Moderate CKD Diet', 'Controlled diet for Stage 3-4', 'stage3_4', 2000, 1500, 1500, 800, 60],
            ['Dialysis Diet Plan', 'High-protein for dialysis', 'stage5_dialysis', 2300, 1000, 1500, 600, 100],
            ['Post-Transplant Nutrition', 'Post-transplant recovery', 'post_transplant', 2200, 2000, 3000, 1200, 80],
            ['Kidney Health Prevention', 'Heart-healthy prevention', 'general_prevention', 2000, 2300, 3500, 1200, 75]
        ];
        
        for (const p of plans) {
            db.run(
                'INSERT INTO meal_plans (name, description, kidney_stage, calories_per_day, sodium_limit_mg, potassium_limit_mg, phosphorus_limit_mg, protein_limit_g) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                p
            );
            console.log('Created:', p[0]);
        }
        
        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
        console.log('\n✓ Meal plans seeded successfully!');
        
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

seedMealPlans();
