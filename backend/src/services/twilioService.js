/**
 * Twilio 2FA Service
 */

const twilio = require('twilio');

// Initialize Twilio client (only if credentials are available)
let twilioClient = null;
try {
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid') {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
} catch (error) {
    console.warn('Twilio client not initialized:', error.message);
}

// Send OTP via SMS
const sendOTP = async (phone, purpose = 'login') => {
    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    // If Twilio is not configured, generate a mock OTP
    if (!twilioClient || !process.env.TWILIO_VERIFY_SERVICE_SID || 
        process.env.TWILIO_VERIFY_SERVICE_SID === 'your-verify-service-sid') {
        console.log(`[MOCK OTP] Sending to ${normalizedPhone} for ${purpose}`);
        const mockOTP = '123456'; // For development/testing
        return {
            success: true,
            mock: true,
            message: 'OTP sent successfully (mock mode)',
            otp: mockOTP // Only in development
        };
    }
    
    try {
        const verification = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
                to: normalizedPhone,
                channel: 'sms'
            });
        
        return {
            success: true,
            message: 'OTP sent successfully',
            sid: verification.sid
        };
    } catch (error) {
        console.error('Twilio send OTP error:', error);
        throw new Error('Failed to send OTP');
    }
};

// Verify OTP
const verifyOTP = async (phone, code, purpose = 'login') => {
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    // If Twilio is not configured, accept mock OTP
    if (!twilioClient || !process.env.TWILIO_VERIFY_SERVICE_SID ||
        process.env.TWILIO_VERIFY_SERVICE_SID === 'your-verify-service-sid') {
        console.log(`[MOCK OTP] Verifying ${code} for ${normalizedPhone}`);
        if (code === '123456') {
            return {
                success: true,
                mock: true,
                message: 'OTP verified successfully (mock mode)'
            };
        }
        return {
            success: false,
            error: 'Invalid OTP'
        };
    }
    
    try {
        const verificationCheck = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
                to: normalizedPhone,
                code: code
            });
        
        if (verificationCheck.status === 'approved') {
            return {
                success: true,
                message: 'OTP verified successfully'
            };
        }
        
        return {
            success: false,
            error: 'Invalid or expired OTP'
        };
    } catch (error) {
        console.error('Twilio verify OTP error:', error);
        throw new Error('Failed to verify OTP');
    }
};

module.exports = {
    sendOTP,
    verifyOTP
};
