/**
 * Bookings Controller
 */

const { db } = require('../models/database');
const { logAudit } = require('../middleware/auditLog');
const { generateMeetLink } = require('../services/googleMeetService');

// Helper to run db operations as promises
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Create booking
const createBooking = async (req, res) => {
    try {
        const { nurseId, availabilityId, bookingType, paymentMethod, notes } = req.body;
        
        // Get patient ID from user
        const patient = await dbGet('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
        
        if (!patient) {
            return res.status(403).json({
                success: false,
                error: 'Patient profile not found'
            });
        }
        
        // Verify availability slot exists and is not booked
        const slot = await dbGet(
            `SELECT a.*, n.consultation_fee, n.user_id as nurse_user_id
             FROM availability a
             JOIN nurses n ON a.nurse_id = n.id
             WHERE a.id = ? AND a.nurse_id = ? AND a.is_booked = 0`,
            [availabilityId, nurseId]
        );
        
        if (!slot) {
            return res.status(400).json({
                success: false,
                error: 'This time slot is not available'
            });
        }
        
        // Verify consultation type matches
        if (slot.consultation_type !== 'both' && slot.consultation_type !== bookingType) {
            return res.status(400).json({
                success: false,
                error: `This slot only supports ${slot.consultation_type} consultations`
            });
        }
        
        // Create booking
        await dbRun(
            `INSERT INTO bookings (patient_id, nurse_id, availability_id, booking_type, status, consultation_fee, payment_method, notes)
             VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
            [patient.id, nurseId, availabilityId, bookingType, slot.consultation_fee, paymentMethod, notes || null]
        );
        
        // Get the last inserted ID
        const bookingResult = await dbGet('SELECT last_insert_rowid() as id');
        const bookingId = bookingResult.id;
        
        // Mark slot as booked
        await dbRun(
            `UPDATE availability SET is_booked = 1 WHERE id = ?`,
            [availabilityId]
        );
        
        // Log audit
        await logAudit(req.user.id, 'CREATE_BOOKING', 'bookings', bookingId, { nurseId, availabilityId }, req);
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                bookingId,
                status: 'pending',
                requiresPayment: paymentMethod === 'cash'
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking'
        });
    }
};

// Get patient's bookings
const getPatientBookings = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify access
        if (req.user.role === 'patient' && req.user.patient_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these bookings'
            });
        }
        
        const bookings = await dbAll(
            `SELECT b.*, 
                    u.first_name as nurse_first_name, u.last_name as nurse_last_name,
                    n.specialization, n.location_city, n.location_province,
                    a.available_date, a.start_time, a.end_time
             FROM bookings b
             JOIN nurses n ON b.nurse_id = n.id
             JOIN users u ON n.user_id = u.id
             JOIN availability a ON b.availability_id = a.id
             WHERE b.patient_id = ?
             ORDER BY a.available_date DESC, a.start_time DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: bookings.map(b => ({
                id: b.id,
                nurse: {
                    id: b.nurse_id,
                    name: `${b.nurse_first_name} ${b.nurse_last_name}`,
                    specialization: b.specialization,
                    location: {
                        city: b.location_city,
                        province: b.location_province
                    }
                },
                date: b.available_date,
                startTime: b.start_time,
                endTime: b.end_time,
                bookingType: b.booking_type,
                status: b.status,
                consultationFee: b.consultation_fee,
                paymentStatus: b.payment_status,
                paymentMethod: b.payment_method,
                meetingLink: b.meeting_link,
                notes: b.notes,
                createdAt: b.created_at
            }))
        });
    } catch (error) {
        console.error('Get patient bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
};

// Get nurse's bookings
const getNurseBookings = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify access
        if (req.user.role === 'nurse' && req.user.nurse_id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these bookings'
            });
        }
        
        const bookings = await dbAll(
            `SELECT b.*,
                    u.first_name as patient_first_name, u.last_name as patient_last_name,
                    p.sa_id_number, p.medical_aid_number,
                    a.available_date, a.start_time, a.end_time
             FROM bookings b
             JOIN patients p ON b.patient_id = p.id
             JOIN users u ON p.user_id = u.id
             JOIN availability a ON b.availability_id = a.id
             WHERE b.nurse_id = ?
             ORDER BY a.available_date DESC, a.start_time DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: bookings.map(b => ({
                id: b.id,
                patient: {
                    id: b.patient_id,
                    name: `${b.patient_first_name} ${b.patient_last_name}`,
                    saIdNumber: b.sa_id_number,
                    medicalAidNumber: b.medical_aid_number
                },
                date: b.available_date,
                startTime: b.start_time,
                endTime: b.end_time,
                bookingType: b.booking_type,
                status: b.status,
                consultationFee: b.consultation_fee,
                paymentStatus: b.payment_status,
                paymentMethod: b.payment_method,
                meetingLink: b.meeting_link,
                notes: b.notes,
                createdAt: b.created_at
            }))
        });
    } catch (error) {
        console.error('Get nurse bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }
        
        // Get booking
        const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Verify nurse owns this booking (unless admin)
        if (req.user.role === 'nurse' && booking.nurse_id !== req.user.nurse_id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this booking'
            });
        }
        
        // Update status
        await dbRun(
            `UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`,
            [status, id]
        );
        
        // If cancelling, free up the availability slot
        if (status === 'cancelled') {
            await dbRun(
                `UPDATE availability SET is_booked = 0 WHERE id = ?`,
                [booking.availability_id]
            );
        }
        
        // Log audit
        await logAudit(req.user.id, 'UPDATE_BOOKING_STATUS', 'bookings', id, { status }, req);
        
        res.json({
            success: true,
            message: 'Booking status updated',
            data: { bookingId: id, status }
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking status'
        });
    }
};

// Generate Google Meet link
const generateGoogleMeetLink = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get booking
        const booking = await dbGet(
            `SELECT b.*, 
                    nu.email as nurse_email, pu.email as patient_email,
                    a.available_date, a.start_time, a.end_time
             FROM bookings b
             JOIN nurses n ON b.nurse_id = n.id
             JOIN users nu ON n.user_id = nu.id
             JOIN patients p ON b.patient_id = p.id
             JOIN users pu ON p.user_id = pu.id
             JOIN availability a ON b.availability_id = a.id
             WHERE b.id = ?`,
            [id]
        );
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        if (booking.booking_type !== 'virtual') {
            return res.status(400).json({
                success: false,
                error: 'Meeting link can only be generated for virtual consultations'
            });
        }
        
        // Verify nurse owns this booking
        if (req.user.role === 'nurse' && booking.nurse_id !== req.user.nurse_id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to generate meeting link'
            });
        }
        
        // Generate meeting time
        const meetingDate = new Date(`${booking.available_date}T${booking.start_time}`);
        const meetingEnd = new Date(`${booking.available_date}T${booking.end_time}`);
        
        // Generate Google Meet link
        const meetResult = await generateMeetLink(
            booking.nurse_email,
            booking.patient_email,
            meetingDate.toISOString(),
            meetingEnd.toISOString(),
            'Kidney Hub Consultation'
        );
        
        // Update booking with meeting link
        if (meetResult.meetingLink) {
            await dbRun(
                `UPDATE bookings SET meeting_link = ? WHERE id = ?`,
                [meetResult.meetingLink, id]
            );
        }
        
        // Log audit
        await logAudit(req.user.id, 'GENERATE_MEET_LINK', 'bookings', id, {}, req);
        
        res.json({
            success: true,
            data: {
                meetingLink: meetResult.meetingLink,
                meetingId: meetResult.meetingId
            }
        });
    } catch (error) {
        console.error('Generate Google Meet link error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate meeting link'
        });
    }
};

module.exports = {
    createBooking,
    getPatientBookings,
    getNurseBookings,
    updateBookingStatus,
    generateGoogleMeetLink
};
