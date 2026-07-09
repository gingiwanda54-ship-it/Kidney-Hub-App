# Kidney Hub Platform Specification

## 1. Introduction

### 1.1 Project Overview
**Project Name:** Kidney Hub  
**Project Type:** Healthcare web platform connecting kidney disease patients with verified nurses in South Africa  
**Core Functionality:** A marketplace and management platform enabling patients to find, verify, and book consultations with qualified kidney disease nurses, with integrated payment processing, identity verification, and 2FA security.  
**Target Users:** 
- Kidney disease patients in South Africa seeking qualified nursing care
- Verified nurses (RNs, Renal Specialists) offering consultation services
- Platform administrators managing the ecosystem

---

## 2. Visual & Design Specification

### 2.1 Color Palette (Kidney/Organ Health Theme)

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Green | `#2E7D32` | Primary buttons, headers, key CTAs |
| Light Kidney Green | `#4CAF50` | Accents, highlights, success states |
| Deep Teal | `#00695C` | Secondary elements, navigation |
| Light Teal | `#26A69A` | Hover states, secondary accents |
| Kidney Cream | `#F1F8E9` | Background tints, cards |
| Pure White | `#FFFFFF` | Main backgrounds, card surfaces |
| Charcoal | `#212121` | Primary text |
| Dark Gray | `#424242` | Secondary text |
| Alert Red | `#D32F2F` | Errors, warnings |
| Amber | `#FFA000` | Warnings, pending states |

### 2.2 Typography

| Element | Font Family | Size | Weight |
|---------|-------------|------|--------|
| H1 (Page Title) | Montserrat | 32px | 700 (Bold) |
| H2 (Section Title) | Montserrat | 24px | 600 (SemiBold) |
| H3 (Card Title) | Montserrat | 18px | 600 (SemiBold) |
| Body Text | Open Sans | 16px | 400 (Regular) |
| Body Small | Open Sans | 14px | 400 (Regular) |
| Caption | Open Sans | 12px | 400 (Regular) |
| Button Text | Montserrat | 14px | 600 (SemiBold) |
| Input Text | Open Sans | 16px | 400 (Regular) |

### 2.3 Spacing System

- Base unit: 8px
- Margins: 16px (small), 24px (medium), 32px (large), 48px (extra-large)
- Padding: 8px (tight), 16px (normal), 24px (relaxed)
- Border radius: 4px (buttons), 8px (cards), 12px (modals)

### 2.4 Layout Wireframe Description

#### 2.4.1 Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo: Kidney Hub]           [Login] [Register]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │  HERO SECTION                                    │     │
│    │  "Find Verified Kidney Care Nurses"              │     │
│    │  [Search Bar: Location / Language / Specialty]  │     │
│    │  [Find a Nurse Button]                          │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    ┌───────────┐  ┌───────────┐  ┌───────────┐             │
│    │  Patients │  │  Nurses   │  │  Book     │             │
│    │  Icon     │  │  Icon     │  │  Icon     │             │
│    │  50+      │  │  25+      │  │  100+     │             │
│    └───────────┘  └───────────┘  └───────────┘             │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │  HOW IT WORKS                                    │     │
│    │  1. Register & Verify  →  2. Find Nurse  →  3.   │     │
│    │     Book Consultation                                │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: About | Contact | Privacy | Terms | © 2024        │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4.2 Patient Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Find Nurses  My Bookings  Profile  [?] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │  MAIN CONTENT AREA                           │
│              │                                              │
│  • Dashboard │  ┌────────────────────────────────────────┐  │
│  • Find Nurse│  │  Welcome, [Patient Name]               │  │
│  • My Bookings│ │  Your upcoming consultations: 2         │  │
│  • Documents │  └────────────────────────────────────────┘  │
│  • Payments  │                                              │
│  • Settings  │  ┌──────────────┐  ┌──────────────────────┐  │
│              │  │ Next Appt    │  │ Quick Actions        │  │
│              │  │ [Card]       │  │ • Book Consultation  │  │
│              │  │              │  │ • View Documents     │  │
│              │  └──────────────┘  │ • Update Profile     │  │
│              │                    └──────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

#### 2.4.3 Nurse Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  My Schedule  Patients  Earnings  Profile  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │  MAIN CONTENT AREA                           │
│              │                                              │
│  • Dashboard │  ┌────────────────────────────────────────┐  │
│  • Schedule  │  │  [Profile Completion Badge] 85%        │  │
│  • Patients  │  │  Complete SANC verification to start   │  │
│  • Earnings  │  └────────────────────────────────────────┘  │
│  • Documents │                                              │
│  • Settings  │  ┌──────────────┐  ┌──────────────────────┐  │
│              │  │ Today's      │  │ Upcoming Bookings    │  │
│              │  │ Appointments │  │ • 10:00 - John D.    │  │
│              │  │ [List]       │  │ • 14:00 - Sarah M.   │  │
│              │  └──────────────┘  └──────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

#### 2.4.4 Nurse Profile & Booking Flow
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  Dr. Sarah van der Berg                   │
│  │ [Photo]     │  Renal Specialist | 12 years experience    │
│  │             │  ⭐ 4.9 (47 reviews)                       │
│  └─────────────┘  Languages: English, Afrikaans, Zulu      │
│                   Location: Cape Town | Virtual Available    │
├─────────────────────────────────────────────────────────────┤
│  TABS: [Overview] [Credentials] [Reviews] [Book]           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SELECT DATE                                         │    │
│  │  [Calendar Widget: Next 30 days available]           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AVAILABLE SLOTS                                     │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │ 09:00 │ │ 10:30 │ │ 14:00 │ │ 15:30 │        │    │
│  │  │Virtual│ │In-Person│ │Virtual│ │Virtual│        │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Consultation Type: ( ) In-Person  (•) Virtual               │
│                                                             │
│  [Book Consultation - R450]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + Vite | React 18.x, Vite 5.x |
| Backend | Node.js + Express | Node 20.x, Express 4.x |
| Database | SQLite | v3 (Production: PostgreSQL) |
| Authentication | JWT + bcrypt | jsonwebtoken, bcrypt 5.x |
| 2FA | Twilio Verify | twilio 4.x |
| Payments | Yoco / Paystack | yoco-sdk, paystack |
| Video | Google Meet API | googleapis |
| File Storage | Local (production: S3) | multer |
| SMS | Twilio | twilio |

### 3.2 Project Structure

```
kidney-hub/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── controllers/     # Business logic controllers
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # External service integrations
│   │   ├── utils/           # Helper functions
│   │   └── index.js
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   └── seed.sql        # Seed data
│   └── package.json
│
├── SPEC.md                   # This specification
└── README.md                # Setup instructions
```

---

## 4. Database Schema

### 4.1 Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'nurse', 'admin') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Patients Table
```sql
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    sa_id_number VARCHAR(13) NOT NULL,
    medical_aid_number VARCHAR(50),
    medical_aid_scheme VARCHAR(100),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    preferred_language VARCHAR(50) DEFAULT 'English',
    chronic_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Nurses Table
```sql
CREATE TABLE nurses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    sanc_registration_number VARCHAR(50) NOT NULL,
    sanc_verified BOOLEAN DEFAULT FALSE,
    bhf_provider_number VARCHAR(50),
    bhf_verified BOOLEAN DEFAULT FALSE,
    specialization VARCHAR(100) DEFAULT 'General',
    years_experience INTEGER DEFAULT 0,
    languages_spoken TEXT,
    consultation_fee DECIMAL(10, 2),
    consultation_types TEXT,
    bio TEXT,
    qualifications TEXT,
    location_city VARCHAR(100),
    location_province VARCHAR(100),
    is_accepting_patients BOOLEAN DEFAULT TRUE,
    profile_completion INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 Availability Table
```sql
CREATE TABLE availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    consultation_type ENUM('in_person', 'virtual', 'both') DEFAULT 'both',
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nurse_id, available_date, start_time)
);
```

### 4.5 Bookings Table
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    availability_id INTEGER NOT NULL REFERENCES availability(id),
    booking_type ENUM('in_person', 'virtual') NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    consultation_fee DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded', 'medical_aid') DEFAULT 'pending',
    payment_method ENUM('cash', 'medical_aid'),
    meeting_link VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6 Payments Table
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.7 Indemnity Forms Table
```sql
CREATE TABLE indemnity_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    form_type ENUM('patient', 'nurse') NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    signature_data TEXT,
    is_valid BOOLEAN DEFAULT TRUE
);
```

### 4.8 Reviews Table
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    nurse_id INTEGER NOT NULL REFERENCES nurses(id),
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.9 Verification Codes Table
```sql
CREATE TABLE verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code VARCHAR(6) NOT NULL,
    purpose ENUM('login', 'registration', 'password_reset', 'payment') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.10 Sessions Table
```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## 5. API Endpoints

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/verify-otp` | Verify 2FA OTP | Yes |
| POST | `/api/auth/resend-otp` | Resend OTP | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with code | No |
| GET | `/api/auth/me` | Get current user | Yes |

### 5.2 Patient Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/patients/profile` | Get patient profile | Patient |
| PUT | `/api/patients/profile` | Update patient profile | Patient |
| POST | `/api/patients/verify-id` | Verify SA ID number | Patient |
| POST | `/api/patients/verify-medical-aid` | Verify medical aid | Patient |
| POST | `/api/patients/lookup-medical-aid` | Lookup by ID | Patient |
| POST | `/api/patients/upload-photo` | Upload profile photo | Patient |
| GET | `/api/patients/documents` | Get patient documents | Patient |

### 5.3 Nurse Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/nurses` | List all nurses (with filters) | No |
| GET | `/api/nurses/:id` | Get nurse profile | No |
| PUT | `/api/nurses/profile` | Update nurse profile | Nurse |
| POST | `/api/nurses/verify-sanc` | Verify SANC registration | Nurse |
| POST | `/api/nurses/verify-bhf` | Verify BHF provider | Nurse |
| POST | `/api/nurses/upload-photo` | Upload profile photo | Nurse |
| GET | `/api/nurses/:id/availability` | Get nurse availability | No |
| GET | `/api/nurses/:id/reviews` | Get nurse reviews | No |

### 5.4 Availability Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/availability` | Get nurse's availability | Nurse |
| POST | `/api/availability` | Create availability slot | Nurse |
| PUT | `/api/availability/:id` | Update availability | Nurse |
| DELETE | `/api/availability/:id` | Delete availability | Nurse |
| GET | `/api/availability/slots` | Get available slots (filtered) | Patient |

### 5.5 Booking Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create new booking | Patient |
| GET | `/api/bookings` | Get user's bookings | Yes |
| GET | `/api/bookings/:id` | Get booking details | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Patient |
| PUT | `/api/bookings/:id/status` | Update booking status | Nurse |
| POST | `/api/bookings/:id/meeting-link` | Generate meeting link | Nurse |

### 5.6 Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/initiate` | Initiate payment | Patient |
| POST | `/api/payments/webhook` | Payment gateway webhook | No |
| GET | `/api/payments/:bookingId` | Get payment status | Patient |
| POST | `/api/payments/verify-medical-aid` | Verify medical aid coverage | Patient |

### 5.7 Review Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reviews` | Create review | Patient |
| GET | `/api/reviews/nurse/:nurseId` | Get nurse reviews | No |

### 5.8 Indemnity Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/indemnity/form` | Get indemnity form content | Yes |
| POST | `/api/indemnity/sign` | Sign indemnity form | Yes |
| GET | `/api/indemnity/status` | Check if user has signed | Yes |

### 5.9 Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |
| GET | `/api/admin/verifications` | Pending verifications | Admin |
| PUT | `/api/admin/verifications/:id` | Approve/reject verification | Admin |
| GET | `/api/admin/bookings` | All bookings | Admin |
| GET | `/api/admin/stats` | Platform statistics | Admin |

---

## 6. Feature Specifications

### 6.1 User Roles & Authentication

#### 6.1.1 Registration Flow
1. User enters email, password, first name, last name
2. Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special char
3. Email verification link sent
4. Role selection (Patient or Nurse)
5. Role-specific profile completion

#### 6.1.2 Login Flow
1. User enters email and password
2. Server validates credentials, returns JWT
3. If 2FA enabled, OTP sent via SMS
4. User enters 6-digit OTP
5. Server validates OTP, returns session token
6. Redirect to appropriate dashboard

#### 6.1.3 Role-Based Access Control
| Role | Dashboard | Permissions |
|------|-----------|-------------|
| Patient | Patient Dashboard | Book consultations, manage profile, view own bookings |
| Nurse | Nurse Dashboard | Manage availability, view patients, update booking status |
| Admin | Admin Dashboard | Manage users, approve verifications, view all data |

### 6.2 Nurse Registration & Verification

#### 6.2.1 SANC Verification
- Input: SANC registration number (format: SANC-XXXXXX)
- Validation: Check against mock SANC API
- Fields verified: Name, registration status, specialty
- Badge displayed: "SANC Verified" (green checkmark)

#### 6.2.2 BHF Verification
- Input: BHF provider number
- Validation: Check against mock BHF API
- Fields verified: Provider name, scheme affiliations
- Badge displayed: "BHF Registered" (blue checkmark)

#### 6.2.3 Profile Completion Requirements
| Field | Points |
|-------|--------|
| SA ID Verification | 20 |
| SANC Registration | 25 |
| BHF Registration | 15 |
| Profile Photo | 10 |
| Bio & Qualifications | 15 |
| Availability Set | 15 |

### 6.3 Patient Registration & Verification

#### 6.3.1 SA ID Validation Rules
- Format: 13 digits
- Check digit validation (Luhn algorithm adapted for SA ID)
- DOB extraction (YYMMDD)
- Gender digit validation
- Citizenship digit validation

#### 6.3.2 Medical Aid Verification
- Input: Medical aid number + scheme name
- Mock API lookup by patient ID
- Returns: Scheme name, member name, coverage type, dependents

### 6.4 Patient-Nurse Matching

#### 6.4.1 Filter Options
| Filter | Type | Description |
|--------|------|-------------|
| Languages | Multi-select | English, Afrikaans, Zulu, Xhosa, Sotho, etc. |
| Specialization | Single-select | General, Dialysis, Transplant, Pediatric |
| Credentials | Multi-select | SANC, BHF, ICU, Renal Cert |
| Experience | Range | 0-5, 5-10, 10-20, 20+ years |
| Location | Province/City | SA provinces and major cities |
| Consultation Type | Single-select | In-person, Virtual, Both |
| Price Range | Min-Max | Consultation fee range |
| Rating | Min rating | 1-5 stars |

#### 6.4.2 Search Algorithm
1. Apply all active filters
2. Sort by: Relevance (default), Rating, Price (low-high), Price (high-low), Experience
3. Paginate results (20 per page)

### 6.5 Consultation Booking

#### 6.5.1 Booking Flow
1. Patient selects nurse profile
2. Views available date slots (future dates only)
3. Selects specific time slot
4. Chooses consultation type (in-person/virtual)
5. Reviews booking summary and fees
6. For cash: Initiates payment via Yoco/Paystack
7. For medical aid: Validates coverage
8. Confirms booking
9. Receives confirmation email/SMS

#### 6.5.2 Booking Statuses
| Status | Description |
|--------|-------------|
| pending | Awaiting payment/confirmation |
| confirmed | Payment received, booking confirmed |
| completed | Consultation completed |
| cancelled | Patient or nurse cancelled |
| no_show | Patient did not attend |

### 6.6 Availability Scheduling

#### 6.6.1 Nurse Availability Management
- Calendar view for next 90 days
- Set recurring availability patterns
- Block specific dates
- Set slot duration (30, 45, 60 minutes)
- Set consultation types per slot

#### 6.6.2 Slot Display Rules
- Show only future dates
- Hide fully booked dates
- Show available slots in local timezone
- Indicate consultation type availability

### 6.7 Payment Processing

#### 6.7.1 Cash Payment Flow
1. Patient initiates payment
2. System creates payment intent via Yoco/Paystack
3. Patient redirected to payment gateway
4. On success: Payment webhook updates booking
5. On failure: Booking remains pending

#### 6.7.2 Medical Aid Flow
1. Patient enters medical aid number
2. System validates coverage via mock API
3. If valid: Booking marked as medical_aid
4. If invalid: Patient prompted to pay cash

#### 6.7.3 Payment Methods
| Method | Integration | Status |
|--------|-------------|--------|
| Credit Card | Yoco SDK | Implemented |
| Debit Card | Yoco SDK | Implemented |
| EFT | Manual verification | Future |
| Medical Aid | Mock verification | Implemented |

### 6.8 Profile Photos

#### 6.8.1 Upload Requirements
- Formats: JPEG, PNG, WebP
- Max size: 5MB
- Min dimensions: 200x200px
- Auto-crop to square
- Stored in `/uploads/profiles/`

#### 6.8.2 Display
- Circular crop in dashboard
- Rounded corners in lists
- Full size in profile view

### 6.9 Two-Factor Authentication (2FA)

#### 6.9.1 Twilio Verify Integration
- SMS OTP for all logins
- SMS OTP for critical actions:
  - Password change
  - Medical aid update
  - Booking cancellation
  - Profile deletion

#### 6.9.2 OTP Specifications
- 6 digits
- 5-minute expiry
- Max 3 attempts
- Auto-lock after 5 failed attempts

### 6.10 Indemnity Forms

#### 6.10.1 Patient Indemnity Form
- Acknowledgment of risks
- Consent to treatment
- Data protection consent
- Emergency contact details
- Medical history disclosure

#### 6.10.2 Nurse Indemnity Form
- Professional liability acknowledgment
- Scope of practice agreement
- Infection control compliance
- Patient confidentiality agreement
- Incident reporting commitment

#### 6.10.3 Signing Flow
1. User views form content
2. Clicks "I Agree" button
3. OTP verification for signing
4. Digital signature recorded
5. Timestamp and IP logged

### 6.11 Data Protection

#### 6.11.1 Authentication Security
- JWT tokens with 24-hour expiry
- Refresh tokens with 7-day expiry
- bcrypt password hashing (cost factor 12)
- Rate limiting on auth endpoints

#### 6.11.2 Input Sanitization
- XSS prevention: HTML entity encoding
- SQL injection: Parameterized queries
- CSRF: Token validation
- File upload: Extension and MIME type validation

#### 6.11.3 Role-Based Access Control
- Middleware validates JWT on every request
- Role check before route access
- Resource ownership validation

#### 6.11.4 GDPR-Style Data Controls
- Right to access: Export personal data
- Right to rectification: Update profile
- Right to erasure: Account deletion (admin approval)
- Data retention: 7 years for medical records
- Data breach notification: 72-hour SLA

---

## 7. Acceptance Criteria

### 7.1 Authentication & Security
- [ ] Users can register with email/password
- [ ] Password meets complexity requirements
- [ ] Login returns JWT token
- [ ] 2FA OTP sent via Twilio for all logins
- [ ] OTP validation grants full access
- [ ] Session expires after 24 hours
- [ ] Logout invalidates session

### 7.2 Patient Features
- [ ] Patient can complete profile
- [ ] SA ID number validates correctly (13-digit + check digit)
- [ ] Medical aid number can be looked up by ID
- [ ] Medical aid coverage can be verified
- [ ] Profile photo can be uploaded
- [ ] Indemnity form can be viewed and signed

### 7.3 Nurse Features
- [ ] Nurse can complete profile
- [ ] SANC registration can be verified (mock API)
- [ ] BHF provider number can be verified (mock API)
- [ ] Availability slots can be created for future dates
- [ ] Availability slots can be edited/deleted
- [ ] Profile photo can be uploaded
- [ ] Booking status can be updated
- [ ] Meeting link can be generated (Google Meet)

### 7.4 Matching & Booking
- [ ] Nurses can be filtered by language
- [ ] Nurses can be filtered by credentials
- [ ] Nurses can be filtered by experience level
- [ ] Available slots display for selected nurse
- [ ] Booking can be created for available slot
- [ ] Booking confirmation sent

### 7.5 Payments
- [ ] Cash payment can be initiated via Yoco/Paystack
- [ ] Payment webhook updates booking status
- [ ] Medical aid booking validates coverage
- [ ] Payment history accessible

### 7.6 Admin Features
- [ ] Admin can view all users
- [ ] Admin can approve/reject verifications
- [ ] Admin can view platform statistics
- [ ] Admin can manage user roles

### 7.7 Visual Design
- [ ] Color palette matches specification (greens, teals, whites)
- [ ] Typography uses Montserrat and Open Sans
- [ ] Layouts match wireframe descriptions
- [ ] Responsive design for mobile/tablet/desktop

### 7.8 Data Protection
- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens properly validated
- [ ] Input sanitization prevents XSS
- [ ] Parameterized queries prevent SQL injection
- [ ] Role-based access enforced on all endpoints

---

## 8. Environment Variables

### 8.1 Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=./database/kidney_hub.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid

# Yoco
YOCO_SECRET_KEY=your-yoco-secret-key
YOCO_PUBLIC_KEY=your-yoco-public-key
YOCO_WEBHOOK_SECRET=your-yoco-webhook-secret

# Paystack (alternative)
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Google Meet
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 8.2 Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Kidney Hub
VITE_APP_URL=http://localhost:5173
```

---

## 9. Mock API Specifications

### 9.1 SA ID Validation API
```
POST /api/mock/validate-sa-id
Request: { "idNumber": "9901015009089" }
Response: {
  "valid": true,
  "dateOfBirth": "1999-01-01",
  "gender": "male",
  "citizenship": "SA Citizen",
  "name": "John"
}
```

### 9.2 Medical Aid Lookup API
```
POST /api/mock/lookup-medical-aid
Request: { "idNumber": "9901015009089" }
Response: {
  "found": true,
  "scheme": "Discovery Health",
  "memberName": "John Doe",
  "memberNumber": "DH123456789",
  "coverageType": "Comprehensive",
  "dependents": 2
}
```

### 9.3 SANC Verification API
```
POST /api/mock/verify-sanc
Request: { "registrationNumber": "SANC-123456" }
Response: {
  "valid": true,
  "name": "Sarah van der Berg",
  "status": "Active",
  "specialty": "Renal Nursing",
  "renewalDate": "2025-12-31"
}
```

### 9.4 BHF Verification API
```
POST /api/mock/verify-bhf
Request: { "providerNumber": "BHF-789012" }
Response: {
  "valid": true,
  "providerName": "Sarah van der Berg",
  "schemes": ["Discovery Health", "Bonitas", "Medihelp"],
  "status": "Active"
}
```

---

## 10. Future Enhancements

- [ ] Video consultation integration (currently: Google Meet link generation)
- [ ] Prescription management
- [ ] Lab results integration
- [ ] Appointment reminders (SMS/Email)
- [ ] In-app messaging between patients and nurses
- [ ] Medical records upload and storage
- [ ] Pharmacy integration for medication delivery
- [ ] Emergency services integration
- [ ] Multi-language support (patient-facing)
- [ ] Mobile app (React Native)

---

## 11. Appendix

### 11.1 Glossary
| Term | Definition |
|------|------------|
| SANC | South African Nursing Council - regulatory body for nurses |
| BHF | Board of Healthcare Funders - medical aid scheme registry |
| Yoco | South African payment gateway for card payments |
| Paystack | Nigerian payment gateway (used as alternative) |
| Google Meet | Video conferencing platform for virtual consultations |
| 2FA | Two-Factor Authentication |
| OTP | One-Time Password |
| JWT | JSON Web Token |
| GDPR | General Data Protection Regulation |

### 11.2 Acronyms
- **SA ID**: South African Identity Number
- **ICU**: Intensive Care Unit
- **EFT**: Electronic Funds Transfer
- **RN**: Registered Nurse
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience

---

*Document Version: 1.0*  
*Last Updated: $(date +%Y-%m-%d)*  
*Author: Kidney Hub Development Team*
