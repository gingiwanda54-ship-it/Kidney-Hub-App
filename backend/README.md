# Kidney Hub Backend API

Backend API for the Kidney Hub healthcare platform connecting kidney disease patients with verified nurses in South Africa.

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.x
- **Database**: SQLite (Production: PostgreSQL)
- **Authentication**: JWT + bcrypt
- **2FA**: Twilio Verify
- **Payments**: Yoco / Paystack (mock integration)
- **Video**: Google Meet API (mock integration)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd data/kidney-hub/backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if needed)
cp .env.example .env

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### Database Setup

The database is automatically created when the server starts. To seed with demo data:

```bash
npm run seed
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/patient` | Register a new patient |
| POST | `/api/auth/register/nurse` | Register a new nurse |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/verify-otp` | Verify 2FA OTP |
| POST | `/api/auth/send-otp` | Resend OTP |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Nurses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nurses` | List all verified nurses |
| GET | `/api/nurses/:id` | Get nurse profile |
| PUT | `/api/nurses/:id/profile` | Update nurse profile |
| POST | `/api/nurses/:id/photo` | Upload profile photo |
| GET | `/api/nurses/:id/availability` | Get nurse availability |
| POST | `/api/nurses/:id/availability` | Set availability |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/:id` | Get patient profile |
| PUT | `/api/patients/:id/profile` | Update patient profile |
| POST | `/api/patients/:id/photo` | Upload profile photo |

### Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verify/sanc` | Verify SANC registration |
| POST | `/api/verify/bhf` | Verify BHF provider |
| POST | `/api/verify/sa-id` | Validate SA ID number |
| POST | `/api/verify/medical-aid` | Verify medical aid |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/patient/:id` | Get patient's bookings |
| GET | `/api/bookings/nurse/:id` | Get nurse's bookings |
| PUT | `/api/bookings/:id` | Update booking status |
| POST | `/api/bookings/:id/google-meet` | Generate Meet link |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/payments/medical-aid-claim` | Submit medical aid claim |

### Indemnity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/indemnity/form` | Get indemnity form |
| POST | `/api/indemnity/sign` | Sign indemnity form |
| GET | `/api/indemnity/status/:userId` | Check signing status |

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./database/kidney_hub.db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Twilio (for 2FA)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid

# Yoco (for payments)
YOCO_SECRET_KEY=your-yoco-key

# Google Meet
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:5173
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database connection
│   ├── routes/          # API routes
│   ├── services/        # External integrations
│   ├── utils/           # Helper functions
│   └── index.js         # Entry point
├── database/
│   ├── schema.sql       # Database schema
│   └── seed.js          # Demo data
├── tests/               # Test files
├── uploads/             # File uploads
├── .env                 # Environment variables
└── package.json
```

## Security Features

- Helmet.js security headers
- Rate limiting on auth endpoints
- Input validation and sanitization
- bcrypt password hashing
- JWT authentication
- Role-based access control
- Audit logging

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | Demo@1234 |
| Nurse | nurse@test.com | Demo@1234 |

## License

ISC
