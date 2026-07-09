/**
 * Seed Education Content Database
 * Usage: node database/seed-education.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/kidney_hub.db';

async function seedEducation() {
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
        
        // Clear existing education content
        db.run('DELETE FROM education_progress');
        db.run('DELETE FROM education_content');
        console.log('Cleared existing education content');
        
        // Define education content
        const content = [
            ['Understanding Your Kidney Function', 'Kidney Basics', 'article', 'Your kidneys are vital organs that filter blood, remove waste, and balance chemicals.', 'Learn how kidneys work.', 'all', 8],
            ['CKD Stages 1-2: What You Need to Know', 'CKD Stages', 'article', 'Stage 1-2 CKD information and management strategies.', 'Early stage CKD.', 'stage1,stage2', 7],
            ['CKD Stages 3-4: Managing Moderate Kidney Disease', 'CKD Stages', 'article', 'Stage 3-4 CKD guidance for patients.', 'Moderate CKD.', 'stage3,stage4', 9],
            ['Stage 5 CKD and Dialysis: Your Options', 'CKD Stages', 'article', 'Stage 5 CKD treatment options including dialysis.', 'Kidney failure.', 'stage5', 10],
            ['Kidney-Friendly Cooking: South African Edition', 'Diet & Nutrition', 'article', 'South African kidney-friendly recipes and cooking tips.', 'Cooking tips.', 'all', 8],
            ['Understanding Your Lab Results', 'Tests & Monitoring', 'article', 'Guide to interpreting kidney-related lab tests.', 'Lab results.', 'all', 7],
            ['Blood Pressure and Kidney Health', 'Tests & Monitoring', 'article', 'Why blood pressure management is crucial for kidney patients.', 'Blood pressure.', 'all', 6],
            ['Living Well on Dialysis', 'Dialysis', 'article', 'Tips for maintaining quality of life while on dialysis.', 'Living on dialysis.', 'stage5', 8],
            ['Kidney Transplant: A New Beginning', 'Transplant', 'article', 'Everything you need to know about kidney transplantation.', 'Transplant guide.', 'stage4,stage5', 9],
            ['Managing Fluid Intake on Dialysis', 'Dialysis', 'article', 'Practical strategies for controlling fluid intake.', 'Fluid tips.', 'stage5', 6],
            ['Preventing Infections on Dialysis', 'Dialysis', 'article', 'Infection prevention strategies for dialysis patients.', 'Stay healthy.', 'stage5', 7],
            ['Medications and Your Kidneys', 'Medications', 'article', 'Essential information about medication safety.', 'Taking meds.', 'all', 8],
            ['Anemia and Kidney Disease', 'Tests & Monitoring', 'article', 'Understanding and managing anemia in CKD.', 'Anemia info.', 'stage3,stage4,stage5', 7],
            ['Mental Health and Kidney Disease', 'Wellness', 'article', 'Addressing emotional and psychological aspects of CKD.', 'Mental wellness.', 'all', 8],
            ['Kidney Disease Knowledge Quiz', 'Diet & Nutrition', 'quiz', 'Test your knowledge about kidney-friendly eating.', 'Quiz time.', 'all', 5],
            ['Understanding Dialysis Quiz', 'Dialysis', 'quiz', 'Test your understanding of dialysis treatment.', 'Quiz time.', 'stage5', 5]
        ];
        
        for (const c of content) {
            db.run(
                'INSERT INTO education_content (title, category, type, body, summary, kidney_stage_relevance, read_time_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                c
            );
            console.log('Created:', c[0]);
        }
        
        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
        console.log('\n✓ Education content seeded successfully!');
        
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

seedEducation();
