import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { connectorConfig, upsertSharedVendor, upsertSharedVendorSchool } from "@dataconnect/admin-generated";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { prisma } from "@/lib/prisma";

loadEnvConfig(process.cwd());

function dataConnect() {
  if (!getApps().length) {
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";
    initializeApp(
      keyFile
        ? { projectId, credential: cert(JSON.parse(readFileSync(keyFile, "utf8"))) }
        : { projectId }
    );
  }
  return getDataConnect(connectorConfig);
}

export async function publishVendors() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { vendorCode: "asc" },
    include: { vendorSchools: { include: { school: { select: { schoolCode: true } } } } }
  });
  const client = dataConnect();
  let mappings = 0;

  for (const vendor of vendors) {
    await upsertSharedVendor(client, {
      vendorCode: vendor.vendorCode,
      preVendorCode: vendor.preVendorCode,
      booksellerCode: vendor.booksellerCode,
      vendorName: vendor.vendorName,
      vendorType: vendor.vendorType,
      vendorRating: vendor.vendorRating,
      actualDiscount: vendor.actualDiscount,
      address: vendor.address,
      district: vendor.district,
      state: vendor.state,
      pinCode: vendor.pinCode,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      taxId: vendor.taxId,
      paymentStatus: vendor.paymentStatus
    });
    for (const mapping of vendor.vendorSchools) {
      await upsertSharedVendorSchool(client, { vendorCode: vendor.vendorCode, schoolCode: mapping.school.schoolCode });
      mappings += 1;
    }
  }

  return { vendors: vendors.length, vendorSchoolMappings: mappings };
}
