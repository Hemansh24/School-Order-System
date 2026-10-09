import { connectorConfig, listSharedPreBooksellers, type ListSharedPreBooksellersData } from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 500;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";

function dataConnect() {
  const app = getApps().length > 0 ? getApp() : initializeApp({ projectId: FIREBASE_PROJECT_ID });
  return getDataConnect(app, connectorConfig);
}

async function listAll() {
  const records: ListSharedPreBooksellersData["sharedPreBooksellers"] = [];
  const client = dataConnect();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedPreBooksellers(client, { limit: PAGE_SIZE, offset });
    records.push(...data.sharedPreBooksellers);
    if (data.sharedPreBooksellers.length < PAGE_SIZE) return records;
  }
}

export async function replacePreBooksellersWithSharedData() {
  const records = await listAll();
  if (records.length === 0) throw new Error("No shared PBS rows were returned from Data Connect. Ask an administrator to publish PBS data.");

  const assignedCodes = records.flatMap((record) => record.assignedBsCode ? [record.assignedBsCode] : []);
  const vendors = await prisma.vendor.findMany({ where: { vendorCode: { in: assignedCodes } }, select: { vendorId: true, vendorCode: true } });
  const vendorIdByCode = new Map(vendors.map((vendor) => [vendor.vendorCode, vendor.vendorId]));

  await prisma.$transaction(async (tx) => {
    await tx.preBookseller.deleteMany();
    await tx.preBookseller.createMany({
      data: records.map((record) => ({
        pbsCode: record.pbsCode,
        sourceBsCode: record.sourceBsCode ?? null,
        vendorName: record.vendorName,
        address: record.address ?? null,
        district: record.district ?? null,
        state: record.state ?? null,
        pinCode: record.pinCode ?? null,
        contactPerson: record.contactPerson ?? null,
        email: record.email ?? null,
        taxId: record.taxId ?? null,
        schoolDealCount: record.schoolDealCount ?? null,
        approximateStrength: record.approximateStrength ?? null,
        groupSchoolCount: record.groupSchoolCount ?? null,
        committedDiscount: record.committedDiscount ?? null,
        transportCollaboration: record.transportCollaboration ?? null,
        bookingStation: record.bookingStation ?? null,
        vendorType: record.vendorType ?? null,
        paymentStatus: record.paymentStatus ?? null,
        conversionStatus: record.conversionStatus,
        assignedBsCode: record.assignedBsCode ?? null,
        convertedAt: record.convertedAt ? new Date(record.convertedAt) : null,
        convertedVendorId: record.assignedBsCode ? vendorIdByCode.get(record.assignedBsCode) ?? null : null
      }))
    });
  });

  return { replaced: records.length };
}
