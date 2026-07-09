-- Kidney Hub Database Schema
-- Security-hardened version

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'nurse', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    is_verified INTEGER DEFAULT 0,
    two_factor_enabled INTEGER DEFAULT 1,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    sa_id_number VARCHAR(255) NOT NULL,
    medical_aid_number VARCHAR(255),
    medical_aid_scheme VARCHAR(100),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    date_of_birth DATE,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    preferred_language VARCHAR(50) DEFAULT 'English',
    chronic_conditions TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Nurses Table
CREATE TABLE IF NOT EXISTS nurses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    sanc_registration_number VARCHAR(50) NOT NULL,
    sanc_verified INTEGER DEFAULT 0,
    bhf_provider_number VARCHAR(50),
    bhf_verified INTEGER DEFAULT 0,
    specialization VARCHAR(100) DEFAULT 'General',
    years_experience INTEGER DEFAULT 0,
    languages_spoken TEXT,
    consultation_fee DECIMAL(10, 2),
    consultation_types TEXT,
    bio TEXT,
    qualifications TEXT,
    location_city VARCHAR(100),
    location_province VARCHAR(100),
    is_accepting_patients INTEGER DEFAULT 1,
    profile_completion INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Availability Table
CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    consultation_type TEXT DEFAULT 'both' CHECK(consultation_type IN ('in_person', 'virtual', 'both')),
    is_booked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(nurse_id, available_date, start_time)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    availability_id INTEGER NOT NULL REFERENCES availability(id),
    booking_type TEXT NOT NULL CHECK(booking_type IN ('in_person', 'virtual')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    consultation_fee DECIMAL(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'medical_aid')),
    payment_method TEXT CHECK(payment_method IN ('cash', 'medical_aid')),
    meeting_link VARCHAR(500),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indemnity Forms Table
CREATE TABLE IF NOT EXISTS indemnity_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    form_type TEXT NOT NULL CHECK(form_type IN ('patient', 'nurse')),
    signed_at TEXT DEFAULT (datetime('now')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    signature_data TEXT,
    is_valid INTEGER DEFAULT 1
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Verification Codes Table
CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code VARCHAR(6) NOT NULL,
    purpose TEXT NOT NULL CHECK(purpose IN ('login', 'registration', 'password_reset', 'payment')),
    expires_at TEXT NOT NULL,
    is_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Health Records Table
CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    nurse_id INTEGER REFERENCES nurses(id),
    type TEXT NOT NULL CHECK(type IN ('vitals', 'lab_result', 'imaging', 'notes')),
    record_date TEXT NOT NULL,
    data TEXT,
    file_url VARCHAR(500),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
);

-- Meal Plans Table
CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    kidney_stage VARCHAR(50) NOT NULL,
    calories_per_day INTEGER DEFAULT 2000,
    sodium_limit_mg INTEGER DEFAULT 2000,
    potassium_limit_mg INTEGER DEFAULT 3000,
    phosphorus_limit_mg INTEGER DEFAULT 1000,
    protein_limit_g INTEGER DEFAULT 75,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Meal Plan Days Table
CREATE TABLE IF NOT EXISTS meal_plan_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id),
    day_number INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Meal Plan Meals Table
CREATE TABLE IF NOT EXISTS meal_plan_meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_day_id INTEGER NOT NULL REFERENCES meal_plan_days(id),
    type TEXT NOT NULL CHECK(type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name VARCHAR(200) NOT NULL,
    ingredients TEXT,
    instructions TEXT,
    image_url VARCHAR(500),
    calories INTEGER DEFAULT 0,
    sodium_mg INTEGER DEFAULT 0,
    potassium_mg INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Meal Plan Assignments Table
CREATE TABLE IF NOT EXISTS meal_plan_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id),
    assigned_by INTEGER REFERENCES nurses(id),
    assigned_at TEXT DEFAULT (datetime('now'))
);

-- Education Content Table
CREATE TABLE IF NOT EXISTS education_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('article', 'video', 'quiz', 'infographic')),
    body TEXT,
    summary TEXT,
    kidney_stage_relevance TEXT,
    read_time_minutes INTEGER DEFAULT 5,
    video_url VARCHAR(500),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Education Progress Table
CREATE TABLE IF NOT EXISTS education_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    content_id INTEGER NOT NULL REFERENCES education_content(id),
    status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
    completed_at TEXT,
    UNIQUE(patient_id, content_id)
);

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    messages TEXT,
    flagged INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- AI Feedback Table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_nurses_user_id ON nurses(user_id);
CREATE INDEX IF NOT EXISTS idx_nurses_sanc ON nurses(sanc_registration_number);
CREATE INDEX IF NOT EXISTS idx_bookings_patient ON bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_nurse ON bookings(nurse_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_availability_nurse ON availability(nurse_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(available_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_patient ON health_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(type);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_stage ON meal_plans(kidney_stage);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan ON meal_plan_days(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_day ON meal_plan_meals(meal_plan_day_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_patient ON meal_plan_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_education_content_category ON education_content(category);
CREATE INDEX IF NOT EXISTS idx_education_content_type ON education_content(type);
CREATE INDEX IF NOT EXISTS idx_education_progress_patient ON education_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_patient ON ai_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_flagged ON ai_conversations(flagged);
