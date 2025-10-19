# Leasing Backend API

**Assignment for Etufillari** - A leasing management backend system demonstrating enterprise-grade TypeScript backend architecture with Azure Functions, comprehensive testing, and clean domain-driven design.

This project showcases a fully functional leasing API with payment processing, installment scheduling, and quote calculation.

## Prerequisites

- **Node.js**: 18.x or higher (tested with Node 20.x)
- **npm**: 10.x or higher
- **Azure Functions Core Tools**: 4.x (`npm install -g azure-functions-core-tools@4`)
- **TypeScript**: 4.x (included in dependencies)

## Quickstart
### 2. Clone Repository
```git clone https://github.com/usmanUA/Leasing-API.git```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Local Settings

Create `local.settings.json` in the project root:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "API_BASE_URL": "http://localhost:7071/api",
    "API_KEY": "Azure-functions-api-architecture-key",
    "DATABASE_URL": "file:./dev.db"
  }
}
```
### 5. Start Local Development Server

```bash
npm start
```

The API will be available at `http://localhost:7071`

### 6. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```



### 7. Test Health Check

```bash
curl http://localhost:7071/api/health-check
```

## API Endpoints

### 📋 Leases

#### Create Lease
```http
POST /api/leases
X-Api-Key: local-dev-key-12345
Content-Type: application/json

{
  "companyId": "company-123",
  "itemId": "item-456",
  "price": 10000,
  "termMonths": 24,
  "nominalRatePct": 5.5,
  "startDate": "2025-01-01T00:00:00Z",
  "upfrontFee": 100,
  "monthlyFee": 15
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "companyId": "company-123",
  "itemId": "item-456",
  "price": 10000,
  "termMonths": 24,
  "nominalRatePct": 5.5,
  "startDate": "2025-01-01T00:00:00Z",
  "upfrontFee": 100,
  "monthlyFee": 15,
  "createdAt": "2025-10-19T12:00:00Z",
  "schedule": [
    {
      "period": 1,
      "dueDate": "2025-02-01",
      "payment": 456.78,
      "interest": 45.83,
      "principal": 395.95,
      "fee": 15.00,
      "balanceAfter": 9604.05
    }
  ],
  "totals": {
    "totalPayments": 10962.72,
    "totalInterest": 602.72,
    "totalFees": 360.00
  }
}
```

#### Get Lease
```http
GET /api/leases/{id}
X-Api-Key: local-dev-key-12345
```

**Response (200)**: Same as Create Lease + `remainingBalance` field

### 💰 Payments

#### Record Payment
```http
POST /api/payments
X-Api-Key: local-dev-key-12345
Content-Type: application/json

{
  "leaseId": "uuid",
  "amount": 456.78
}
```

**Response (200)**:
```json
{
  "id": "payment-uuid",
  "leaseId": "lease-uuid",
  "amount": 456.78,
  "paidAt": "2025-10-19T12:00:00Z"
}
```

### 📊 Quote

#### Calculate Quote
```http
GET /api/quote?price=10000&termMonths=24&nominalRatePct=5.5&upfrontFee=100&monthlyFee=15
X-Api-Key: local-dev-key-12345
```

**Response (200)**:
```json
{
  "monthlyPayment": 456.78,
  "totalPayments": 10962.72,
  "totalInterest": 602.72,
  "totalFee": 360.00,
  "schedule": [...]
}
```

### ❤️ Health Check

```http
GET /api/health
```

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T12:00:00Z",
  "version": "1.0.0"
}
```

## Error Handling

All errors follow a consistent structure:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input provided",
  "details": [
    {
      "field": "price",
      "message": "Price must be positive"
    }
  ]
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `LEASECALCULATION` | 422 | Business logic error in lease calculation |
| `PAYMENTCALCULATION` | 422 | Business logic error in payment calculation |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Domain Models

### Lease Calculation Logic

The system uses the **declining balance method** for amortization:

1. **Monthly Interest** = Remaining Balance × (Annual Rate / 12)
2. **Principal Payment** = Total Price / Term Months (evenly distributed)
3. **Monthly Payment** = Principal + Interest + Monthly Fee
4. **Remaining Balance** = Previous Balance - Principal Payment

All monetary values are rounded to **cents precision** (2 decimal places).

### Validation Rules

- **Price**: Must be positive
- **Term**: 1-48 months (integer)
- **Interest Rate**: 0-30% annual percentage
- **Fees**: Non-negative
- **Start Date**: ISO 8601 datetime format
- **Company/Item IDs**: Non-empty strings
- **Lease ID**: Valid UUID v4
- **Payment Amount**: Must be positive

## Testing

### Test Coverage

```
Test Suites: 6 passed, 6 total
Tests:       20 passed, 20 total
```

#### Unit Tests
- **Domain Layer**: Lease calculations, payment processing
- **Service Layer**: Business logic, validation, error handling

#### Integration Tests
- **API Endpoints**: Lease creation, retrieval, payment recording
- **Authentication**: API key validation
- **Error Scenarios**: Invalid inputs, missing resources

### Running Specific Test Suites

```bash
# Unit tests only
npm test -- tests/unit

# Integration tests only
npm test -- tests/integration

# Specific test file
npm test -- tests/unit/domain/lease.test.ts
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | API authentication key | Yes | - |
| `API_BASE_URL` | Base Urls | Yes | - |



### TypeScript Configuration

The project uses **strict mode** with the following settings:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true
}
```

## Azure Deployment

### Prerequisites
- Azure CLI installed and authenticated
- Azure Functions app created
- Storage account configured

### Deploy Steps

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Azure**:
```bash
func azure functionapp publish <YOUR_FUNCTION_APP_NAME>
```

3. **Configure App Settings**:
```bash
az functionapp config appsettings set \
  --name <YOUR_FUNCTION_APP_NAME> \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --settings \
    API_KEY="your-production-api-key" \
    COSMOS_ENDPOINT="your-cosmos-endpoint" \
    COSMOS_KEY="your-cosmos-key"
```


## 🎯 Assignment Requirements

✅ **Azure Functions v3 (v4 is used in the assignment)** with Node.js 14.x  (Node 20.x is used in the assignment)
✅ **TypeScript strict mode** with no `any` types  
✅ **Clean architecture** following Etufillari folder structure  
✅ **Zod validation** for all inputs  
✅ **API key authentication** middleware  
✅ **Comprehensive testing**: 20 tests across unit and integration  
✅ **Domain-driven design** with proper separation of concerns  
✅ **Error handling** with correlation IDs and structured responses  
✅ **Documentation** with clear setup and deployment instructions  
✅ **Runnable locally** with `npm start` and `npm test`

## 📊 Quality Metrics

- **Type Safety**: 100% (strict TypeScript, no `any`)
- **Test Coverage**: 20 tests across 6 suites
- **Code Organization**: Clean architecture with multiple distinct layers
- **API Consistency**: RESTful design with standardized error responses
- **Documentation**: Comprehensive README with examples

## Compatibility

**Tested Environment:**
- Node.js: 20.11.0
- Azure Functions Core Tools: 4.0.5571
- npm: 10.2.4

**Supported Versions:**
- Node.js: 20.x (LTS)
- Azure Functions: v4
- npm: 10.x or higher

**Note**: While the code may work with Node.js 18+, it has been thoroughly tested with Node 20.x. Using the exact tested versions is recommended for the most reliable experience.

## Notes

- This system demonstrates **production-ready patterns** for the Etufillari assignment
- All calculations use **declining balance amortization** method
- Payment tracking supports **partial payments** and **overpayment detection**
- The API follows **RESTful conventions** with proper HTTP status codes
- **Correlation IDs** are used throughout for request tracing
- All monetary values are handled with **cents precision** to avoid floating-point errors

## License

This project is created as a technical assignment for Etufillari.

---

