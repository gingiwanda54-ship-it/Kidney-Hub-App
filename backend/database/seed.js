/**
 * Database Seed Script
 * Populates the database with demo data
 */

require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH || './database/kidney_hub.db';
const db = new sqlite3.Database(dbPath);

const seedDatabase = async () => {
    console.log('🌱 Seeding database...');
    
    // Hash password for demo users
    const passwordHash = await bcrypt.hash('Demo@1234', 12);
    
    db.serialize(() => {
        // Insert demo nurses
        const insertNurse = db.prepare(`
            INSERT INTO nurses (user_id, sanc_registration_number, sanc_verified, bhf_provider_number, bhf_verified, 
                               specialization, years_experience, languages_spoken, consultation_fee, consultation_types, 
                               bio, location_city, location_province, is_accepting_patients, profile_completion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const nurses = [
            {
                userId: null,
                sanc: 'SANC123456',
                sancVerified: 1,
                bhf: 'BHF789012',
                bhfVerified: 1,
                spec: 'Renal Nursing',
                exp: 12,
                langs: '["English", "Afrikaans"]',
                fee: 450.00,
                types: 'both',
                bio: 'Experienced renal nurse specializing in dialysis care and kidney disease management.',
                city: 'Cape Town',
                province: 'Western Cape',
                accepting: 1,
                completion: 85
            },
            {
                userId: null,
                sanc: 'SANC234567',
                sancVerified: 1,
                bhf: 'BHF890123',
                bhfVerified: 1,
                spec: 'Critical Care',
                exp: 8,
                langs: '["English", "Zulu"]',
                fee: 380.00,
                types: 'virtual',
                bio: 'Critical care nurse with experience in ICU and emergency medicine.',
                city: 'Johannesburg',
                province: 'Gauteng',
                accepting: 1,
                completion: 70
            },
            {
                userId: null,
                sanc: 'SANC345678',
                sancVerified: 1,
                bhf: 'BHF901234',
                bhfVerified: 1,
                spec: 'Dialysis',
                exp: 15,
                langs: '["English", "Afrikaans", "Xhosa"]',
                fee: 500.00,
                types: 'both',
                bio: 'Senior dialysis nurse with 15 years of experience in hemodialysis and peritoneal dialysis.',
                city: 'Durban',
                province: 'KwaZulu-Natal',
                accepting: 1,
                completion: 90
            }
        ];
        
        nurses.forEach(nurse => {
            insertNurse.run(
                nurse.userId, nurse.sanc, nurse.sancVerified, nurse.bhf, nurse.bhfVerified,
                nurse.spec, nurse.exp, nurse.langs, nurse.fee, nurse.types,
                nurse.bio, nurse.city, nurse.province, nurse.accepting, nurse.completion
            );
        });
        
        // Insert demo patients
        const insertPatient = db.prepare(`
            INSERT INTO patients (user_id, sa_id_number, medical_aid_number, medical_aid_scheme, preferred_language)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const patients = [
            { userId: null, saId: '8801015009089', medAid: 'DH123456789', scheme: 'Discovery Health', lang: 'English' },
            { userId: null, saId: '9002015009089', medAid: 'BT987654321', scheme: 'Bonitas', lang: 'Afrikaans' }
        ];
        
        patients.forEach(patient => {
            insertPatient.run(patient.userId, patient.saId, patient.medAid, patient.scheme, patient.lang);
        });
        
        // Insert availability slots
        const insertAvailability = db.prepare(`
            INSERT INTO availability (nurse_id, available_date, start_time, end_time, consultation_type)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const today = new Date();
        for (let day = 1; day <= 14; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() + day);
            const dateStr = date.toISOString().split('T')[0];
            
            // Morning slots
            insertAvailability.run(1, dateStr, '09:00', '09:30', 'both');
            insertAvailability.run(1, dateStr, '10:00', '10:30', 'both');
            insertAvailability.run(1, dateStr, '11:00', '11:30', 'virtual');
            
            // Afternoon slots
            insertAvailability.run(1, dateStr, '14:00', '14:30', 'both');
            insertAvailability.run(1, dateStr, '15:00', '15:30', 'both');
            
            // Nurse 2 slots
            insertAvailability.run(2, dateStr, '10:00', '10:30', 'virtual');
            insertAvailability.run(2, dateStr, '14:00', '14:30', 'virtual');
            
            // Nurse 3 slots
            insertAvailability.run(3, dateStr, '08:00', '08:30', 'both');
            insertAvailability.run(3, dateStr, '09:00', '09:30', 'both');
            insertAvailability.run(3, dateStr, '13:00', '13:30', 'both');
        }
        
        console.log('✅ Demo data inserted');
    });
    
    db.close();
    console.log('🌱 Database seeding complete!');
};

seedDatabase().catch(console.error);
