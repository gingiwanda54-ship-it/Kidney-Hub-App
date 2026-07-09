/**
 * Kidney Hub API Integration Tests
 * Uses supertest to test the API endpoints
 */

const request = require('supertest');

// Set test environment before requiring app
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4';

const app = require('../src/index');

describe('Kidney Hub API Tests', () => {
    // Wait for database to initialize
    beforeAll(async () => {
        // Give the database time to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
    }, 10000);

    describe('Health Check', () => {
        test('GET /health should return success', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Kidney Hub API is running');
            expect(response.body.version).toBe('1.0.0');
        });
    });

    describe('API Info', () => {
        test('GET /api should return API info', async () => {
            const response = await request(app)
                .get('/api')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.endpoints).toBeDefined();
            expect(response.body.endpoints.auth).toBe('/api/auth');
            expect(response.body.endpoints.nurses).toBe('/api/nurses');
        });
    });

    describe('Nurses Endpoint', () => {
        test('GET /api/nurses should return list of nurses', async () => {
            const response = await request(app)
                .get('/api/nurses')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('GET /api/nurses/:id should return 404 for non-existent nurse', async () => {
            const response = await request(app)
                .get('/api/nurses/99999')
                .expect(404);
            
            expect(response.body.success).toBe(false);
        });
    });

    describe('Patient Registration', () => {
        test('POST /api/auth/register/patient should register a new patient', async () => {
            const uniqueEmail = `patient${Date.now()}@test.com`;
            const response = await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: uniqueEmail,
                    password: 'Test@1234',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '0831234567',
                    saIdNumber: '9901015009089',
                    medicalAidNumber: 'DH123456789'
                })
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.userId).toBeDefined();
            expect(response.body.data.requiresOTP).toBe(true);
        });

        test('POST /api/auth/register/patient should fail with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: 'duplicate@test.com',
                    password: 'Test@1234',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '0831234567',
                    saIdNumber: '9901015009089'
                })
                .expect(201);
            
            // Second registration with same email should fail
            const response2 = await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: 'duplicate@test.com',
                    password: 'Test@1234',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    phone: '0831234568',
                    saIdNumber: '9001015009089'
                })
                .expect(409);
            
            expect(response2.body.success).toBe(false);
            expect(response2.body.error).toContain('already registered');
        });

        test('POST /api/auth/register/patient should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: 'invalid-email',
                    password: 'Test@1234',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '0831234567',
                    saIdNumber: '9901015009089'
                })
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });

        test('POST /api/auth/register/patient should fail with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: 'weak@test.com',
                    password: 'weak',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '0831234567',
                    saIdNumber: '9901015009089'
                })
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });
    });

    describe('Nurse Registration', () => {
        test('POST /api/auth/register/nurse should register a new nurse', async () => {
            const uniqueEmail = `nurse${Date.now()}@test.com`;
            const response = await request(app)
                .post('/api/auth/register/nurse')
                .send({
                    email: uniqueEmail,
                    password: 'Test@1234',
                    firstName: 'Sarah',
                    lastName: 'Smith',
                    phone: '0841234567',
                    sancNumber: 'SANC123456',
                    bhfNumber: 'BHF789012',
                    languages: ['English', 'Afrikaans'],
                    experience: 5,
                    consultationType: 'both'
                })
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.userId).toBeDefined();
        });
    });

    describe('Login', () => {
        test('POST /api/auth/login should send OTP for valid credentials', async () => {
            // First register a user
            const uniqueEmail = `login${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register/patient')
                .send({
                    email: uniqueEmail,
                    password: 'Test@1234',
                    firstName: 'Login',
                    lastName: 'Test',
                    phone: '0851234567',
                    saIdNumber: '9001015009089'
                });
            
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: uniqueEmail,
                    password: 'Test@1234'
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.requiresOTP).toBe(true);
        });

        test('POST /api/auth/login should fail with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Test@1234'
                })
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
    });

    describe('Indemnity Form', () => {
        test('GET /api/indemnity/form should require authentication', async () => {
            const response = await request(app)
                .get('/api/indemnity/form')
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
    });

    describe('404 Handler', () => {
        test('GET /api/nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);
            
            expect(response.body.success).toBe(false);
        });
    });
});
