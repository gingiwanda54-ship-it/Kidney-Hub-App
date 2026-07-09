/**
 * Payments Controller
 */

const { db } = require('../models/database');
const { logAudit } = require('../middleware/auditLog');
const { initiatePayment, confirmPayment, processMedicalAidClaim } = require('../services/paymentService');

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

// Initiate payment
const initiateCashPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;
        
        // Get booking and patient info
        const booking = await dbGet(
            `SELECT b.*, u.email as patient_email
             FROM bookings b
             JOIN patients p ON b.patient_id = p.id
             JOIN users u ON p.user_id = u.id
             WHERE b.id = ?`,
            [bookingId]
        );
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Verify patient owns this booking
        if (req.user.role === 'patient' && booking.patient_id !== req.user.patient_id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to pay for this booking'
            });
        }
        
        // Initiate payment
        const paymentResult = await initiatePayment(
            bookingId,
            amount || booking.consultation_fee,
            paymentMethod,
            booking.patient_email
        );
        
        // Log audit
        await logAudit(req.user.id, 'INITIATE_PAYMENT', 'payments', paymentResult.paymentId, { bookingId, amount }, req);
        
        res.json({
            success: true,
            data: paymentResult
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate payment'
        });
    }
};

// Confirm payment
const confirmCashPayment = async (req, res) => {
    try {
        const { transactionId, bookingId } = req.body;
        
        const result = await confirmPayment(transactionId, bookingId);
        
        // Log audit
        await logAudit(req.user.id, 'CONFIRM_PAYMENT', 'payments', null, { transactionId, bookingId }, req);
        
        res.json({
            success: true,
            message: 'Payment confirmed',
            data: result
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to confirm payment'
        });
    }
};

// Submit medical aid claim
const submitMedicalAidClaim = async (req, res) => {
    try {
        const { bookingId, medicalAidNumber, patientIdNumber } = req.body;
        
        // Get booking
        const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Process claim
        const claimResult = await processMedicalAidClaim(bookingId, medicalAidNumber, patientIdNumber);
        
        // Log audit
        await logAudit(req.user.id, 'SUBMIT_MEDICAL_AID_CLAIM', 'payments', null, { bookingId }, req);
        
        res.json({
            success: true,
            data: claimResult
        });
    } catch (error) {
        console.error('Submit medical aid claim error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit medical aid claim'
        });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const payment = await dbGet(
            `SELECT p.*, b.consultation_fee
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             WHERE p.booking_id = ?
             ORDER BY p.created_at DESC
             LIMIT 1`,
            [bookingId]
        );
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: payment.id,
                bookingId: payment.booking_id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.payment_method,
                status: payment.status,
                transactionId: payment.transaction_id,
                createdAt: payment.created_at
            }
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment status'
        });
    }
};

module.exports = {
    initiateCashPayment,
    confirmCashPayment,
    submitMedicalAidClaim,
    getPaymentStatus
};
