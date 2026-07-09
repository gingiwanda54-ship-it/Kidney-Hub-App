# Kidney Hub - API Configuration Guide

This document lists all required API keys and credentials needed to run the Kidney Hub application in production.

## Environment Variables

All configuration is managed through environment variables in `/workspace/data/kidney-hub/backend/.env`.

### Required API Keys

#### 1. Twilio (2FA SMS Authentication)

Twilio provides SMS-based OTP (One-Time Password) for two-factor authentication.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | [Twilio Console](https://console.twilio.com) |
| `TWILIO_VERIFY_SERVICE_SID` | Verify Service SID | Create a Verify Service in Twilio Console |

**Setup Instructions:**
1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Navigate to Console > Account Info for SID and Auth Token
3. Create a Verify Service: Console > Verify > Create new Verify Service
4. Copy the Service SID into `TWILIO_VERIFY_SERVICE_SID`

#### 2. Yoco (Payment Processing)

Yoco is a South African payment gateway for processing card payments.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `YOCO_SECRET_KEY` | Yoco Secret API Key | [Yoco Dashboard](https://dashboard.yoco.com) |
| `YOCO_PUBLIC_KEY` | Yoco Public API Key | [Yoco Dashboard](https://dashboard.yoco.com) |
| `YOCO_WEBHOOK_SECRET` | Webhook signature verification | [Yoco Dashboard](https://dashboard.yoco.com) |

**Setup Instructions:**
1. Register for a Yoco merchant account at [yoco.com](https://www.yoco.com)
2. Access your API keys from the Developer/Dashboard section
3. Configure webhook URL: `https://your-domain.com/api/payments/webhook`

#### 3. Paystack (Alternative Payment Gateway)

Paystack is an alternative payment gateway (primarily Nigerian, but supported).

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `PAYSTACK_SECRET_KEY` | Paystack Secret Key | [Paystack Dashboard](https://dashboard.paystack.com) |
| `PAYSTACK_PUBLIC_KEY` | Paystack Public Key | [Paystack Dashboard](https://dashboard.paystack.com) |

**Setup Instructions:**
1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Navigate to Settings > API Keys
3. Copy the test and live keys

#### 4. Google Meet (Video Consultations)

Google Meet API for generating video consultation links.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_REDIRECT_URI` | OAuth Redirect URI | Configure in Google Cloud Console |

**Setup Instructions:**
1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the Google Meet API
3. Create OAuth 2.0 credentials
4. Configure authorized redirect URIs
5. Set `GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback` for development

#### 5. OpenAI (AI Health Assistant)

OpenAI API for the AI-powered health assistant chatbot.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | OpenAI API Key | [OpenAI Platform](https://platform.openai.com/api-keys) |

**Setup Instructions:**
1. Create an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new secret key
4. Monitor usage and set billing limits

**Note:** The AI chatbot currently works in demo mode without OpenAI API. For production, integrate the OpenAI API for enhanced responses.

### Optional Configuration

#### File Upload Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |
| `MAX_FILE_SIZE` | `5242880` (5MB) | Maximum file upload size in bytes |

#### JWT Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | (required) | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `24h` | JWT token expiration |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token expiration |
| `BCRYPT_ROUNDS` | `12` | bcrypt hashing rounds |

### Security Notes

1. **Never commit API keys to version control**
2. Use environment variables or a secrets manager in production
3. Rotate API keys periodically
4. Use test keys in development, live keys in production
5. Enable webhook signature verification where available

### Testing Without Real API Keys

The application includes mock implementations for all external services:
- **Twilio**: Mock OTP validation (any 6-digit code works)
- **Yoco/Paystack**: Mock payment processing
- **Google Meet**: Mock meeting link generation
- **OpenAI**: Rule-based response generation

Set any placeholder value in the `.env` file to enable the mock mode.

### Demo/Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | Demo@1234 |
| Nurse | nurse@test.com | Demo@1234 |
| Admin | admin@test.com | Demo@1234 |

---

*Document Version: 1.0*
*Last Updated: $(date +%Y-%m-%d)*
