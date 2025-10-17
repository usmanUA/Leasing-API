import prisma from "../lib/prisma";
import { Lease } from "../domain/lease";


export async function createLease(lease: Lease): Promise<string> {
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
}

export async function getLeaseById(id: string): Promise<Lease> {
    const lease = await prisma.lease.findUnique({
	where: { id },
    });

    if (!lease) throw new Error("Lease not found");

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
}
