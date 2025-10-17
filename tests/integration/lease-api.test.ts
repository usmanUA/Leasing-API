import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';
const API_KEY = process.env.API_KEY || 'etufillari-backend-architecture-key';

describe('Lease API Integration Tests', () => {
    let createdLeaseId: string;

    test('POST /api/leases create a new lease', async () => {
	try {
	    const response = await axios.post(
		`${API_BASE_URL}/leases`,
		{
		    companyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		    itemId: "item786",
		    price: 1200,
		    termMonths: 24,
		    nominalRatePct: 5.1,
		    startDate: "2025-11-01T00:00:00.000Z",
		    upfrontFee: 50,
		    monthlyFee: 10
		},
		{
		    headers: { 'x-api-key': API_KEY }
		}
	    );
	    expect(response.status).toBe(200);
	    expect(response.data).toHaveProperty('id');
	    expect(response.data.price).toBe(1200);

	    createdLeaseId = response.data.id;
	} catch (error) {
	    if (error instanceof Error) {
		console.error('Test failed with error: ', error)
	    }
	}

    });

    test('GET /api/leases/{id} returns lease with remaining balance', async () => {
	try {
	    const postResponse = await axios.post(
		`${API_BASE_URL}/leases`,
		{
		    companyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		    itemId: "item786",
		    price: 1200,
		    termMonths: 24,
		    nominalRatePct: 5.1,
		    startDate: "2025-11-01T00:00:00.000Z",
		    upfrontFee: 50,
		    monthlyFee: 10
		},
		{
		    headers: { 'x-api-key': API_KEY }
		}
	    );
	    createdLeaseId = postResponse.data.id;
	    const getResponse = await axios.get(
		`${API_BASE_URL}/leases/${createdLeaseId}`,
		{
		headers: { 'x-api-key': API_KEY }
		}
	    );
	    expect(getResponse.status).toBe(200);
	    expect(getResponse.data.id).toBe(createdLeaseId);
	    expect(getResponse.data).toHaveProperty('remainingBalance');
	    expect(getResponse.data).toHaveProperty('schedule');
	} catch (error) {
	    if (error instanceof Error) {
		console.error('Test failed with error: ', error)
	    }
	}

    });

    test('POST /api/leases without API key returns 401 Unauthorized', async () => {
	try {
	    await axios.post(`${API_BASE_URL}/leases`,
		{
		    companyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		    itemId: "item786",
		    price: 1200,
		    termMonths: 24,
		    nominalRatePct: 5.1,
		    startDate: "2025-11-01T00:00:00.000Z",
		    upfrontFee: 50,
		    monthlyFee: 10
		},
		{}
	    );
	} catch (error) {
	    if (error instanceof AxiosError) {
		expect(error.response?.status).toBe(401);
	    } else {
		throw new Error(`Unexpected error type: ${error}`);
	    }
	}
    });
});
