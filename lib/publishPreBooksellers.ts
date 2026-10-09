import { readFileSync } from "node:fs";

import { loadEnvConfig } from "@next/env";
import { connectorConfig, upsertPreBookseller } from "@dataconnect/admin-generated";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { prisma } from "@/lib/prisma";

loadEnvConfig(process.cwd());

function getAdminDataConnect() {
  if (getApps().length === 0) {
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    initializeApp(keyFile ? { credential: cert(JSON.parse(readFileSync(keyFile, "utf8"))) } : undefined);
  }
  return getDataConnect(connectorConfig);
}

export async function publishPreBooksellers() {
  const records = await prisma.preBookseller.findMany({ orderBy: { pbsCode: "asc" } });
  const dataConnect = getAdminDataConnect();

  for (const record of records) {
    await upsertPreBookseller(dataConnect, {
      pbsCode: record.pbsCode,
      sourceBsCode: record.sourceBsCode,
      vendorName: record.vendorName,
      address: record.address,
      district: record.district,
      state: record.state,
      pinCode: record.pinCode,
      contactPerson: record.contactPerson,
      email: record.email,
      taxId: record.taxId,
      schoolDealCount: record.schoolDealCount,
      approximateStrength: record.approximateStrength,
      groupSchoolCount: record.groupSchoolCount,
      committedDiscount: record.committedDiscount,
      transportCollaboration: record.transportCollaboration,
      bookingStation: record.bookingStation,
      vendorType: record.vendorType,
      paymentStatus: record.paymentStatus,
      conversionStatus: record.conversionStatus,
      assignedBsCode: record.assignedBsCode,
      convertedAt: record.convertedAt?.toISOString() ?? null
    });
  }

  return { published: records.length };
}
