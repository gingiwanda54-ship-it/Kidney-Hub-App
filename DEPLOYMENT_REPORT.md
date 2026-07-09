# Kidney Hub — Deployment Report

**Date:** July 9, 2026  
**Status:** Live  
**Environment:** Toqan VPC (Google Cloud Run)

---

## Live URLs

| Service | URL | Service ID | Status |
|---------|-----|------------|--------|
| **Frontend** | https://env-9675af46-kidney-hub-ywko2s1n-z5qufmrqoq-oc.a.run.app | `env-9675af46-kidney-hub-ywko2s1n` | ✅ Succeeded |
| **Backend API** | https://env-9675af46-kidney-hub-backend-f9kvtwmv-z5qufmrqoq-oe.a.run.app | `env-9675af46-kidney-hub-backend-f9kvtwmv` | ✅ Succeeded |

> **Access:** Both apps are accessible via the **Apps** section in the Toqan UI. They open as signed iframes inside the Toqan platform. The URLs above are the raw Cloud Run endpoints; users should access them through the Toqan Apps interface.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Patient** | patient@test.com | `Demo@1234` |
| **Nurse** | nurse@test.com | `Demo@1234` |
| **Admin** | admin@test.com | `Demo@1234` |

> Demo accounts are seeded automatically on first deployment. OTP for 2FA: any 6-digit code (e.g. `123456`) in mock mode.

---

## Full Feature List

### Patient Features
- Registration with SA ID validation and medical aid verification
- Profile management with photo upload
- Browse and search verified kidney care nurses (filtered by location, specialty, rating)
- Book video consultations with nurses
- Upload and track health records and vitals
- View and sign indemnity forms
- View assigned meal plans
- AI health assistant chatbot (kidney health topics)
- Educational content with quizzes and progress tracking
- Booking history and payment history

### Nurse Features
- Registration with SANC and BHF professional verification
- Profile management with availability scheduling
- View and manage patient bookings
- Access patient health records (with consent)
- Add patient vitals and records on behalf of patients
- Google Meet link generation for video consultations
- Receive and respond to reviews

### Platform Features
- JWT-based authentication with two-factor authentication (Twilio SMS OTP)
- Payment processing via Yoco and Paystack (mock integration)
- Indemnity form management
- AI chatbot with crisis escalation (emergency numbers)
- Role-based access control (Patient / Nurse / Admin)
- Rate limiting and security headers (Helmet)
- CORS-aware cross-origin configuration

---

## API Documentation

Base URL: `https://env-9675af46-kidney-hub-backend-f9kvtwmv-z5qufmrqoq-oe.a.run.app/api`

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/patient` | Register a new patient account |
| POST | `/auth/register/nurse` | Register a new nurse account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/verify-otp` | Verify 2FA OTP code |
| POST | `/auth/send-otp` | Resend OTP |
| POST | `/auth/logout` | Logout current session |
| GET | `/auth/me` | Get current authenticated user |

### Patients (`/patients`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients/profile` | Get patient profile |
| PUT | `/patients/profile` | Update patient profile |
| POST | `/patients/verify-id` | Validate SA ID number |
| POST | `/patients/verify-medical-aid` | Verify medical aid membership |
| POST | `/patients/lookup-medical-aid` | Lookup medical aid scheme |
| POST | `/patients/upload-photo` | Upload profile photo |
| GET | `/patients/documents` | List patient documents |
| GET | `/patients/records` | List health records |
| GET | `/patients/records/:id` | Get specific health record |
| POST | `/patients/records/vitals` | Upload vitals reading |
| POST | `/patients/records/upload` | Upload document/record |
| GET | `/patients/records/vitals` | Get vitals history |
| GET | `/patients/meal-plan` | Get assigned meal plan |
| GET | `/patients/ai/conversations` | Get AI chat history |

### Nurses (`/nurses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nurses` | List all verified nurses (with filters) |
| GET | `/nurses/:id` | Get nurse profile |
| PUT | `/nurses/profile` | Update nurse profile |
| POST | `/nurses/verify-sanc` | Verify SANC registration |
| POST | `/nurses/verify-bhf` | Verify BHF provider number |
| POST | `/nurses/upload-photo` | Upload profile photo |
| GET | `/nurses/:id/availability` | Get nurse availability |
| GET | `/nurses/:id/reviews` | Get nurse reviews |
| GET | `/nurses/patients/:id` | Get patient by ID (nurse view) |
| GET | `/nurses/patients/:patientId/records` | Get patient records |
| POST | `/nurses/patients/:patientId/records/vitals` | Add patient vitals |

### Availability (`/availability`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/availability` | Get availability slots |
| POST | `/availability` | Create availability slot |
| PUT | `/availability/:id` | Update availability slot |
| DELETE | `/availability/:id` | Delete availability slot |
| GET | `/availability/slots` | Get available slots by date/nurse |

### Bookings (`/bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create a new booking |
| GET | `/bookings` | Get all bookings (role-filtered) |
| GET | `/bookings/:id` | Get booking details |
| PUT | `/bookings/:id/cancel` | Cancel a booking |
| PUT | `/bookings/:id/status` | Update booking status |
| POST | `/bookings/:id/meeting-link` | Generate Google Meet link |

### Payments (`/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/initiate` | Initiate payment |
| GET | `/payments/:bookingId` | Get payment status |
| POST | `/payments/verify-medical-aid` | Verify medical aid for payment |
| POST | `/payments/webhook` | Payment gateway webhook |

### Reviews (`/reviews`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Create a review |
| GET | `/reviews/nurse/:nurseId` | Get reviews for a nurse |

### Indemnity (`/indemnity`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/indemnity/form` | Get indemnity form content |
| POST | `/indemnity/sign` | Sign indemnity form |
| GET | `/indemnity/status` | Get signing status |

### Meal Plans (`/meal-plans`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meal-plans` | List meal plans |
| GET | `/meal-plans/admin` | List all meal plans (admin) |
| GET | `/meal-plans/:id` | Get meal plan details |
| POST | `/meal-plans` | Create meal plan (admin) |
| PUT | `/meal-plans/:id` | Update meal plan |
| DELETE | `/meal-plans/:id` | Delete meal plan |
| POST | `/meal-plans/:id/assign` | Assign to current patient |
| POST | `/meal-plans/:id/assign/bulk` | Bulk assign to patients |
| GET | `/meal-plans/:id/grocery-list` | Get grocery list |

### Education (`/education`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/education` | List educational content |
| GET | `/education/featured` | Get featured content |
| GET | `/education/personalized` | Get personalized content |
| GET | `/education/recent` | Get recently viewed |
| GET | `/education/history` | Get viewing history |
| GET | `/education/progress` | Get learning progress |
| GET | `/education/badges` | Get earned badges |
| GET | `/education/:id/quiz` | Get quiz for content |
| POST | `/education/:id/quiz/progress` | Save quiz progress |
| POST | `/education/:id/bookmark` | Bookmark content |
| DELETE | `/education/:id/bookmark` | Remove bookmark |
| GET | `/education/admin` | Admin: list all content |
| POST | `/education` | Admin: create content |
| PUT | `/education/:id` | Admin: update content |
| DELETE | `/education/:id` | Admin: delete content |

### AI Chatbot (`/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Send message to AI assistant |
| GET | `/ai/conversations` | Get all conversations |
| GET | `/ai/conversations/:id` | Get specific conversation |
| GET | `/ai/conversations/flagged` | Get flagged conversations (admin) |
| POST | `/ai/conversations/:id/flag` | Flag a conversation |
| DELETE | `/ai/conversations/:id/flag` | Unflag a conversation |

### Mock Services (`/mock`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mock/validate-sa-id` | Validate South African ID number |
| POST | `/mock/lookup-medical-aid` | Lookup medical aid scheme |
| POST | `/mock/verify-sanc` | Verify SANC nurse registration |
| POST | `/mock/verify-bhf` | Verify BHF provider number |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/health` | Backend health check (alt) |

---

## Configuration — Required API Keys

All configuration is in `/workspace/data/kidney-hub/backend/.env`.

### Twilio (2FA SMS)
| Variable | Where to Get |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | [Twilio Console](https://console.twilio.com) |
| `TWILIO_VERIFY_SERVICE_SID` | Create a Verify Service in Twilio Console |

### Yoco (Payments — South Africa)
| Variable | Where to Get |
|----------|-------------|
| `YOCO_SECRET_KEY` | [Yoco Dashboard](https://dashboard.yoco.com) |
| `YOCO_PUBLIC_KEY` | [Yoco Dashboard](https://dashboard.yoco.com) |

### Paystack (Alternative Payments)
| Variable | Where to Get |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | [Paystack Dashboard](https://dashboard.paystack.com) |

### Google Meet (Video Consultations)
| Variable | Where to Get |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_REDIRECT_URI` | Configure in Google Cloud Console |

### OpenAI (AI Chatbot)
| Variable | Where to Get |
|----------|-------------|
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) |

### Demo/Mock Mode
All external services fall back to mock implementations when placeholder values are used. The following work without real API keys:
- Twilio: any 6-digit OTP code accepted
- Yoco/Paystack: mock payment confirmation
- Google Meet: mock meeting link generation
- OpenAI: rule-based response generation

---

## Known Limitations

1. **Database is ephemeral:** Container storage is wiped on each redeploy. Database (SQLite) resets to seeded state. For production, migrate to PostgreSQL with a managed database service.

2. **File uploads are not persisted:** Uploaded files (profile photos, health records) are stored in the container's ephemeral filesystem and are lost on redeploy. Integrate cloud storage (e.g. Google Cloud Storage, AWS S3) for production.

3. **AI chatbot without OpenAI API:** Rule-based fallback responses are used when `OPENAI_API_KEY` is not set. Responses are limited in sophistication.

4. **Mock verification services:** SANC, BHF, SA ID, and medical aid verification use mock validators. In production, integrate real verification APIs.

5. **Google Meet mock links:** Meeting links are generated as mock URLs. For production, implement real Google Meet OAuth and API integration.

6. **No email notifications:** Email notifications (booking confirmations, etc.) are not implemented. Integrate SendGrid or AWS SES for production.

7. **Indemnity form is static:** The indemnity form content is baked into the database seed. Admin UI for managing form content is not implemented.

8. **Meal plan assignments:** Bulk meal plan assignment triggers a mock notification email. Real email delivery requires SMTP/SendGrid configuration.

---

## Emergency Contact Numbers (AI Chatbot)

The AI chatbot is configured to provide these emergency numbers when users express distress:

| Service | Number |
|---------|--------|
| **ER / Ambulance (South Africa)** | **082-911** |
| **Kidney Hub Hotline** | **015-267-0004** |
| **SAPS Emergency** | **10111** |
| **Suicide Crisis Line (South Africa)** | **0800-567-567** |
| **National Blood Service (South Africa)** | **0800-BLOOD-1** |

> **Important:** The AI chatbot provides informational support only and is not a substitute for professional medical advice. Crisis escalation is triggered when keywords such as "suicide", "kill myself", "end my life", or "emergency" are detected.

---

## Updating the Deployment

### Redeploy Backend
```bash
# After code changes, rebuild and redeploy:
/workspace/skills/deploying-apps/deploy --update env-9675af46-kidney-hub-backend-v4a6ttux /workspace/data/kidney-hub/backend --display-name "Kidney Hub Backend"
```

### Redeploy Frontend
```bash
# After frontend code changes:
# 1. Update .env with new backend URL if needed
# 2. Rebuild:
cd /workspace/data/kidney-hub/frontend && npm run build
# 3. Redeploy:
/workspace/skills/deploying-apps/deploy --update env-9675af46-kidney-hub-ywko2s1n /workspace/data/kidney-hub/frontend --display-name "Kidney Hub"
```

### Get Service Status
```bash
/workspace/skills/deploying-apps/logs <service_id>
/workspace/skills/deploying-apps/apps
```

### Take Offline
```bash
/workspace/skills/deploying-apps/destroy <service_id>
```

---

*Report generated by ToqanClaw Generator Agent on July 9, 2026*

---

## Redeployment — July 2026 (Fix Frontend 404)

### Issue
Frontend Cloud Run service was returning 404 because the static SPA files weren't being served correctly — Cloud Run doesn't natively support SPA routing (serving `index.html` for all routes).

### Fix Applied
1. Created `server.cjs` — a minimal Node.js HTTP server that serves files from `dist/` and falls back to `index.html` for any non-existent path (SPA routing fix). Placed alongside `dist/` at project root.
2. Updated `package.json` start script from `npx serve dist -l ${PORT:-8080}` → `node server.cjs` so Cloud Run uses the custom server.
3. Redeployed both services using `deploy --update` to preserve their existing `service_id`s.

### Deployment Results
| Service | Service ID | Status |
|---------|------------|--------|
| **Frontend** | `env-9675af46-kidney-hub-ywko2s1n` | ✅ Succeeded |
| **Backend API** | `env-9675af46-kidney-hub-backend-f9kvtwmv` | ✅ Succeeded |

> Note: Direct curl access to Cloud Run URLs is not available from the sandbox (services run inside Toqan VPC, accessible via the Apps iframe in the Toqan UI).
