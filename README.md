# Kidney Hub

A comprehensive healthcare web platform connecting kidney disease patients with verified nurses in South Africa.

![Kidney Hub](https://img.shields.io/badge/Kidney%20Hub-Healthcare-green)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

## Overview

Kidney Hub is a healthcare marketplace and management platform enabling patients to find, verify, and book consultations with qualified kidney disease nurses. The platform includes integrated payment processing, identity verification, two-factor authentication, and AI-powered health assistance.

### Key Features

- **Patient-Nurse Matching**: Find nurses by language, specialization, credentials, and location
- **Video Consultations**: Book and conduct virtual consultations via Google Meet
- **Health Records Management**: Upload, track, and share medical records
- **Meal Planning**: Access personalized kidney-friendly meal plans
- **AI Health Assistant**: Get 24/7 guidance on kidney health, diet, and medications
- **Education Hub**: Learn about CKD stages, dialysis, transplant, and lifestyle management
- **Secure Payments**: Process payments via Yoco or Paystack
- **2FA Security**: Two-factor authentication via SMS (Twilio)

## Tech Stack

### Frontend
- **React 18.x** with Vite 5.x
- **React Router 7.x** for routing
- **Tailwind CSS 3.x** for styling
- **Recharts 2.x** for data visualization
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js 20.x** with Express 4.x
- **SQLite** (development) / **PostgreSQL** (production ready)
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-rate-limit** for rate limiting
- **Helmet** for security headers

### External Integrations
- **Twilio** - SMS 2FA
- **Yoco** - Payment processing
- **Paystack** - Alternative payments
- **Google Meet** - Video consultations
- **OpenAI** - AI health assistant (optional)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd /workspace/data/kidney-hub
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your API keys (or use placeholders for demo mode)
   
   # Start the server
   npm start
   ```
   
   The backend will run on `http://localhost:3001`

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

4. **Seed Demo Data (optional):**
   ```bash
   cd ../backend
   npm run seed
   ```

### Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | Demo@1234 |
| Nurse | nurse@test.com | Demo@1234 |
| Admin | admin@test.com | Demo@1234 |

## Project Structure

```
kidney-hub/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Page components
│   │   │   ├── auth/           # Authentication pages
│   │   │   ├── patient/        # Patient dashboard & features
│   │   │   ├── nurse/          # Nurse dashboard & features
│   │   │   └── shared/         # Shared pages
│   │   ├── contexts/           # React contexts (Auth, Theme)
│   │   ├── services/          # API service layer
│   │   ├── styles/            # Global styles
│   │   └── App.jsx            # Main app with routes
│   ├── public/
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Database connection
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # External integrations
│   │   ├── utils/            # Helper functions
│   │   └── index.js           # Entry point
│   ├── database/
│   ├── uploads/               # File uploads
│   ├── .env                    # Environment variables
│   └── package.json
│
├── SPEC.md                     # Detailed specification
├── CONFIGURATION.md            # API configuration guide
└── README.md                   # This file
```

## Features

### For Patients

- **Dashboard**: Overview of upcoming appointments, recent activity
- **Find Nurses**: Search and filter by language, specialization, credentials
- **Book Consultations**: Schedule virtual or in-person appointments
- **Health Records**: Upload and track vitals, lab results, medical documents
- **Meal Plans**: Access personalized kidney-friendly meal plans
- **Education Hub**: Articles, quizzes, and progress tracking
- **AI Assistant**: 24/7 health guidance with medical disclaimers
- **Payments**: Secure payment processing for consultations

### For Nurses

- **Dashboard**: Today's appointments, upcoming schedule, earnings
- **Availability Management**: Set and manage consultation slots
- **Patient Management**: View assigned patient records
- **Meal Plan Assignment**: Create and assign meal plans
- **Education Content**: Create educational materials
- **AI Conversations**: Monitor and review flagged AI conversations
- **Earnings Tracking**: View consultation payment history

### For Administrators

- **User Management**: View and manage all users
- **Verification Dashboard**: Approve/reject nurse SANC and BHF verifications
- **Platform Statistics**: Overview of bookings, users, and activity
- **Content Management**: Manage education content and meal plans

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/patient` | Register patient | No |
| POST | `/api/auth/register/nurse` | Register nurse | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/verify-otp` | Verify 2FA OTP | Yes |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Nurses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/nurses` | List nurses | No |
| GET | `/api/nurses/:id` | Get nurse profile | No |
| PUT | `/api/nurses/profile` | Update profile | Nurse |
| POST | `/api/nurses/verify-sanc` | Verify SANC | Nurse |
| POST | `/api/nurses/verify-bhf` | Verify BHF | Nurse |

### Patients
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/patients/profile` | Get profile | Patient |
| PUT | `/api/patients/profile` | Update profile | Patient |
| POST | `/api/patients/verify-id` | Verify SA ID | Patient |
| GET | `/api/patients/records` | Get health records | Patient |

### Health Records
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/records` | Create record | Nurse |
| GET | `/api/records/patient/:id` | Get patient records | Yes |
| GET | `/api/records/patient/:id/trends` | Get trends | Yes |

### Meal Plans
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meal-plans` | List meal plans | No |
| POST | `/api/meal-plans` | Create meal plan | Nurse |
| POST | `/api/meal-plans/:id/assign` | Assign to patient | Nurse |

### Education
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/education` | List content | No |
| GET | `/api/education/featured` | Featured content | Yes |
| POST | `/api/education` | Create content | Nurse |

### AI Assistant
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/chat` | Chat with AI | Patient |
| GET | `/api/ai/conversations/:patientId` | Get conversation | Yes |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Patient |
| GET | `/api/bookings` | Get bookings | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Yes |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/initiate` | Initiate payment | Patient |
| POST | `/api/payments/webhook` | Payment webhook | No |

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./database/kidney_hub.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Twilio (2FA)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid

# Yoco (Payments)
YOCO_SECRET_KEY=your-yoco-key
YOCO_PUBLIC_KEY=your-yoco-public-key

# Paystack (Alternative Payments)
PAYSTACK_SECRET_KEY=your-paystack-key

# Google Meet
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI (AI Assistant)
OPENAI_API_KEY=your-openai-api-key

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Kidney Hub
VITE_APP_URL=http://localhost:5173
```

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed API key setup instructions.

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **bcrypt Password Hashing**: Cost factor 12 for strong hashing
- **2FA via Twilio**: SMS OTP for all logins
- **Rate Limiting**: 10 requests/15min on auth, 100 requests/min general
- **Helmet Security Headers**: XSS, clickjacking, and injection protection
- **Role-Based Access Control**: Patient, Nurse, Admin roles
- **Input Validation**: Request validation on all endpoints
- **File Upload Limits**: 10MB max, allowed types only
- **Audit Logging**: Track sensitive operations

## Known Limitations

1. **AI Assistant**: Uses rule-based responses by default; OpenAI integration optional
2. **Video Consultations**: Meeting links are generated but actual video not embedded
3. **Medical Aid Verification**: Mock API only; production requires real integration
4. **Database**: SQLite for development; PostgreSQL recommended for production
5. **File Storage**: Local storage for development; S3 or cloud storage for production
6. **SMS Delivery**: Mock mode in development; requires Twilio for real SMS
7. **Payment Processing**: Mock mode by default; requires Yoco/Paystack for real payments

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Output in dist/ folder
```

## License

ISC

---

Built with ❤️ for kidney health in South Africa
