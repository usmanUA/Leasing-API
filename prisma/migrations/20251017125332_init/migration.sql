-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "nominalRatePct" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "upfrontFee" REAL NOT NULL,
    "monthlyFee" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "schedule" TEXT NOT NULL,
    "totals" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaseId" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
