// src/persistence/lease-repository.ts

import prisma from "../lib/prisma";
import { Lease } from "../domain/lease";
import { logger } from "../../src/lib/logger";

export class LeaseRepositoryError extends Error {
    constructor(message: string, public readonly cause?: Error) {
	super(message);
	this.name = 'LeaseRepositoryError'
    }
}

export async function createLease(lease: Lease): Promise<Lease | null> {
    try {
	const newLease = await prisma.lease.create({
	    data: {
		id: lease.id,
		companyId: lease.companyId,
		itemId: lease.itemId,
		price: lease.price,
		termMonths: lease.termMonths,
		nominalRatePct: lease.nominalRatePct,
		startDate: lease.startDate,
		upfrontFee: lease.upfrontFee,
		monthlyFee: lease.monthlyFee,
		createdAt: new Date(lease.createdAt),
		schedule: JSON.stringify(lease.schedule),
		totals: JSON.stringify(lease.totals)
	    }

	});

	if (!newLease) {
	    logger.info("Failed to create lease in the database", { leaseId: lease.id });
	    return null;
	}

	logger.info("Lease created in the database", {
	    leaseId: newLease.id,
	    companyId: lease.companyId
	});

	const leaseResponse: Lease = {
            id: newLease.id,
            companyId: newLease.companyId,
            itemId: newLease.itemId,
            price: newLease.price,
            termMonths: newLease.termMonths,
            nominalRatePct: newLease.nominalRatePct,
            startDate: newLease.startDate.toISOString(),
            upfrontFee: newLease.upfrontFee,
            monthlyFee: newLease.monthlyFee,
            createdAt: newLease.createdAt.toISOString(),
            schedule: JSON.parse(newLease.schedule),
            totals: JSON.parse(newLease.totals)
        };

	return leaseResponse;
    } catch (error) {
	const errorMessage = error instanceof Error ? error.message : "Unknow database error"
	logger.error("Database error while creating the lease", {
	    leaseId: lease.id,
	    companyId: lease.companyId,
	    erro: errorMessage
	});

	throw new LeaseRepositoryError(
	    `Failed to create lease in the database: ${errorMessage}`,
	    error instanceof Error ? error : undefined
	);
    }
}

export async function getLeaseById(id: string): Promise<Lease | null> {
    try {
	const lease = await prisma.lease.findUnique({
	    where: { id }
	});

	if (!lease) {
	    logger.info("Lease not found in the database", { leaseId: id });
	    return null;
	}

	logger.info("Lease fetched from the database", { leaseId: id });

	return {
		id: lease.id,
		companyId: lease.companyId,
		itemId: lease.itemId,
		price: lease.price,
		termMonths: lease.termMonths,
		nominalRatePct: lease.nominalRatePct,
		startDate: lease.startDate.toISOString(),
		upfrontFee: lease.upfrontFee,
		monthlyFee: lease.monthlyFee,
		createdAt: lease.createdAt.toISOString(),
		schedule: JSON.parse(lease.schedule),
		totals: JSON.parse(lease.totals),
	};
    } catch (error) {
	const errorMessage = error instanceof Error ? error.message : "Unknown database error";

	logger.error("Failed to fetch lease from database", {
	    leaseId: id,
	    error: errorMessage
	});

	throw new LeaseRepositoryError(
	    `Failed to fetch lease: ${errorMessage}`,
	    error instanceof Error ? error : undefined
	);
    };
}
