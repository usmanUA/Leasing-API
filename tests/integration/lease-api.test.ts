import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';
const API_KEY = process.env.API_KEY || 'etufillari-backend-architecture-key';

describe('Lease API Integration Tests', () => {

    const leaseInput = {
	companyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	itemId: "item786",
	price: 1200,
	termMonths: 24,
	nominalRatePct: 5.1,
	startDate: "2025-11-01T00:00:00.000Z",
	upfrontFee: 50,
	monthlyFee: 10,
    };

    test('POST /api/leases create a new lease and returns 200 with lease ID', async () => {
	const response = await axios.post(
	    `${API_BASE_URL}/leases`, leaseInput,
	    {
		headers: { 'x-api-key': API_KEY }
	    }
	);
	expect(response.status).toBe(200);
	expect(response.data).toHaveProperty('id');
	expect(response.data.price).toBe(leaseInput.price);
	expect(response.data.schedule).toHaveLength(leaseInput.termMonths);
    });

    test('GET /api/leases/{id} returns lease with remaining balance', async () => {
	const postResponse = await axios.post(
	    `${API_BASE_URL}/leases`, leaseInput,
	    {
		headers: { 'x-api-key': API_KEY }
	    }
	);

	const leaseId = postResponse.data.id;
	const getResponse = await axios.get(
	    `${API_BASE_URL}/leases/${leaseId}`,
	    {
	    headers: { 'x-api-key': API_KEY }
	    }
	);
	expect(getResponse.status).toBe(200);
	expect(getResponse.data.id).toBe(leaseId);
	expect(getResponse.data).toHaveProperty('remainingBalance');
	expect(getResponse.data).toHaveProperty('schedule');
	expect(getResponse.data.schedule).toBeInstanceOf(Array);
    });

    test('POST /api/leases without API key returns 401 Unauthorized', async () => {
	await expect(
	    axios.post(`${API_BASE_URL}/leases`, leaseInput,
	    {}
	)).rejects.toMatchObject({ response: { status: 401 } });
    });
});
