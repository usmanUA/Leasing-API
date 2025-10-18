import prisma from "../lib/prisma";
import { Lease } from "../domain/lease";
import { logger } from "@/lib/logger";


export async function createLease(lease: Lease): Promise<string> {
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
	})
	return newLease.id;
    } catch (error) {
	logger.error("Database error while creating the lease");
	throw new Error("Failed to create lease in the database");
    }
}

export async function getLeaseById(id: string): Promise<Lease> {
    try {
	const lease = await prisma.lease.findUnique({
	    where: { id }
	});

	if (!lease) throw new Error("Lease not found");

	return {
		id: lease.id,
		companyId: lease.companyId,
		itemId: lease.itemId,
		price: lease.price,
		termMonths: lease.termMonths,
		nominalRatePct: lease.nominalRatePct,
		startDate: lease.startDate.toISOString().split("T")[0],
		upfrontFee: lease.upfrontFee,
		monthlyFee: lease.monthlyFee,
		createdAt: lease.createdAt.toISOString(),
		schedule: JSON.parse(lease.schedule),
		totals: JSON.parse(lease.totals),
	};
    } catch (error) {
	if (error instanceof Error && error.message === "Lease not found") throw error;
	logger.error("Error while retrieving  lease from Database");
	throw new Error("Failed to retrieve lease from database");
    };
}
