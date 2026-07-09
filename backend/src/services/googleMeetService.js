/**
 * Google Meet Service for generating video conference links
 */

const { google } = require('googleapis');

// Initialize Google Calendar client
let calendarClient = null;

const initializeGoogleClient = () => {
    if (process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
        );
        
        calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
    }
};

initializeGoogleClient();

// Generate Google Meet link
const generateMeetLink = async (nurseEmail, patientEmail, startTime, endTime, topic) => {
    // If Google Calendar is not configured, return mock link
    if (!calendarClient) {
        console.log('[MOCK Google Meet] Generating meeting link');
        const mockMeetingId = Math.random().toString(36).substring(2, 15);
        return {
            success: true,
            mock: true,
            meetingLink: `https://meet.google.com/${mockMeetingId}`,
            meetingId: mockMeetingId,
            message: 'Meeting link generated (mock mode)'
        };
    }
    
    try {
        // Create calendar event with Google Meet conference
        const event = {
            summary: topic || 'Kidney Hub Consultation',
            start: {
                dateTime: startTime,
                timeZone: 'Africa/Johannesburg'
            },
            end: {
                dateTime: endTime,
                timeZone: 'Africa/Johannesburg'
            },
            conferenceData: {
                createRequest: {
                    requestId: `kidney-hub-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            attendees: [
                { email: nurseEmail },
                { email: patientEmail }
            ]
        };
        
        const response = await calendarClient.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });
        
        const meetLink = response.data.hangoutLink;
        const meetingId = meetLink ? meetLink.split('/').pop() : null;
        
        return {
            success: true,
            meetingLink: meetLink,
            meetingId: meetingId,
            eventId: response.data.id
        };
    } catch (error) {
        console.error('Google Meet generation error:', error);
        throw new Error('Failed to generate meeting link');
    }
};

module.exports = {
    generateMeetLink
};
