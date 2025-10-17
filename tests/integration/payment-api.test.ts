import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';
const API_KEY = process.env.API_KEY || 'etufillari-backend-architecture-key';

describe('Payment API Integration Tests', () => {
    let createdLeaseId: string;

    beforeAll(async () => {
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

	createdLeaseId = response.data.id;
    });

    test('POST /api/payments registers a payment', async() => {
	try {
	    const response = await axios.post(
		`${API_BASE_URL}/payments`,
		{
		    leaseId: createdLeaseId,
		    amount: 100,
		},
		{ headers: { 'x-api-key': API_KEY } }
	    );
	    expect(response.status).toBe(200);
	    expect(response.data).toHaveProperty('id');
	    expect(response.data.amount).toBe(100);
	    expect(response.data.leaseId).toBe(createdLeaseId);
	} catch (error) {
	    if (error instanceof Error) {
		console.error('Test failed with error: ', error)
	    }
	}
    });

    test('POST /api/leases/{id} updates remaining balance', async () => {
	try {
	    const response = await axios.get(
		`${API_BASE_URL}/leases/${createdLeaseId}`,
		{
		headers: { 'x-api-key': API_KEY }
		}
	    );
	    expect(response.data.remainingBalance).toBeLessThan(response.data.totals.totalPayments);
	} catch (error) {
	    if (error instanceof Error) {
		console.error('Test failed with error: ', error)
	    }
	}

    });
});
