/**
 * Payment Service - Yoco/Paystack Integration
 */

const { db } = require('../models/database');

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

// Mock payment processing (for development)
const mockPayment = async (amount, currency = 'ZAR') => {
    console.log(`[MOCK PAYMENT] Processing ${currency} ${amount}`);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    return {
        success: true,
        mock: true,
        transactionId,
        amount,
        currency,
        status: 'completed',
        message: 'Payment processed successfully (mock mode)'
    };
};

// Initiate Yoco payment
const initiateYocoPayment = async (amount, bookingId, customerEmail) => {
    // If Yoco is not configured, use mock
    if (!process.env.YOCO_SECRET_KEY || process.env.YOCO_SECRET_KEY === 'your-yoco-secret-key') {
        return mockPayment(amount);
    }
    
    try {
        // Yoco API integration would go here
        // For now, return mock response
        return mockPayment(amount);
    } catch (error) {
        console.error('Yoco payment error:', error);
        throw new Error('Payment initiation failed');
    }
};

// Initiate Paystack payment
const initiatePaystackPayment = async (amount, bookingId, customerEmail) => {
    // If Paystack is not configured, use mock
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'your-paystack-secret-key') {
        return mockPayment(amount);
    }
    
    try {
        // Paystack API integration would go here
        // For now, return mock response
        return mockPayment(amount);
    } catch (error) {
        console.error('Paystack payment error:', error);
        throw new Error('Payment initiation failed');
    }
};

// Confirm payment and update booking
const confirmPayment = async (transactionId, bookingId) => {
    await dbRun(
        `UPDATE payments SET status = 'completed', gateway_response = ? WHERE transaction_id = ?`,
        [JSON.stringify({ confirmedAt: new Date().toISOString() }), transactionId]
    );
    
    // Update booking payment status
    await dbRun(
        `UPDATE bookings SET payment_status = 'paid' WHERE id = ?`,
        [bookingId]
    );
    
    return {
        success: true,
        message: 'Payment confirmed',
        bookingId
    };
};

// Process medical aid claim (mock)
const processMedicalAidClaim = async (bookingId, medicalAidNumber, patientIdNumber) => {
    console.log(`[MOCK MEDICAL AID] Processing claim for booking ${bookingId}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock claim result
    const claimResult = {
        success: true,
        mock: true,
        claimId: `CLM${Date.now()}`,
        status: 'pending',
        message: 'Medical aid claim submitted (mock mode)',
        details: {
            scheme: 'Discovery Health',
            patientName: 'Patient',
            referenceNumber: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
    };
    
    // Update booking with medical aid status
    await dbRun(
        `UPDATE bookings SET payment_status = 'medical_aid' WHERE id = ?`,
        [bookingId]
    );
    
    return claimResult;
};

// Initiate general payment
const initiatePayment = async (bookingId, amount, method, customerEmail) => {
    // Validate booking exists
    const booking = await dbGet(
        `SELECT b.*, n.consultation_fee 
         FROM bookings b
         JOIN nurses n ON b.nurse_id = n.id
         WHERE b.id = ?`,
        [bookingId]
    );
    
    if (!booking) {
        throw new Error('Booking not found');
    }
    
    // Create payment record
    await dbRun(
        `INSERT INTO payments (booking_id, amount, payment_method, status)
         VALUES (?, ?, ?, 'pending')`,
        [bookingId, amount, method]
    );
    
    // Get the last inserted ID
    const result = await dbGet('SELECT last_insert_rowid() as id');
    const paymentId = result.id;
    
    // Process payment based on method
    let paymentResult;
    if (method === 'cash') {
        paymentResult = await initiateYocoPayment(amount, bookingId, customerEmail);
    } else if (method === 'medical_aid') {
        paymentResult = await processMedicalAidClaim(bookingId, booking.medical_aid_number, null);
    }
    
    // Update payment with transaction ID
    if (paymentResult.transactionId) {
        await dbRun(
            `UPDATE payments SET transaction_id = ?, gateway_response = ? WHERE id = ?`,
            [paymentResult.transactionId, JSON.stringify(paymentResult), paymentId]
        );
    }
    
    return {
        success: true,
        paymentId,
        ...paymentResult
    };
};

module.exports = {
    initiateYocoPayment,
    initiatePaystackPayment,
    confirmPayment,
    processMedicalAidClaim,
    initiatePayment
};
