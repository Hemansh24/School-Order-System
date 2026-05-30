import { PrismaClient, SourceType } from "@prisma/client";

const prisma = new PrismaClient();

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  await prisma.orderSheet3.deleteMany();
  await prisma.orderSheet2B2.deleteMany();
  await prisma.orderSheet2B1.deleteMany();
  await prisma.orderSheet2A.deleteMany();
  await prisma.orderSheet1.deleteMany();
  await prisma.vendorSchool.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.schoolBranch.deleteMany();
  await prisma.school.deleteMany();
  await prisma.item.deleteMany();

  const [greenwood, riverside, sunrise] = await Promise.all([
    prisma.school.create({
      data: {
        schoolCode: "SCH-001",
        schoolName: "Greenwood Public School",
        schoolBranches: {
          create: {
            branchName: "Main",
            address: "Sector 14",
            contactPerson: "Anita Rao",
            phone: "9876500011",
            email: "admin@greenwood.example"
          }
        }
      }
    }),
    prisma.school.create({
      data: {
        schoolCode: "SCH-002",
        schoolName: "Riverside International School",
        schoolBranches: {
          create: {
            branchName: "Main",
            address: "Lake Road",
            contactPerson: "Kabir Sen",
            phone: "9876500022",
            email: "orders@riverside.example"
          }
        }
      }
    }),
    prisma.school.create({
      data: {
        schoolCode: "SCH-003",
        schoolName: "Sunrise Model School",
        schoolBranches: {
          create: {
            branchName: "Main",
            address: "MG Avenue",
            contactPerson: "Meera Das",
            phone: "9876500033",
            email: "office@sunrise.example"
          }
        }
      }
    })
  ]);

  const [northBooks, cityDepot] = await Promise.all([
    prisma.vendor.create({
      data: {
        vendorCode: "VEN-001",
        vendorName: "North Booksellers",
        vendorType: "regional distributor",
        vendorRating: "A",
        contactPerson: "Raghav Mehta",
        phone: "9000011111",
        email: "ops@northbooks.example"
      }
    }),
    prisma.vendor.create({
      data: {
        vendorCode: "VEN-002",
        vendorName: "City Book Depot",
        vendorType: "retail partner",
        vendorRating: "B",
        contactPerson: "Priya Nair",
        phone: "9000022222",
        email: "orders@citydepot.example"
      }
    })
  ]);

  await prisma.vendorSchool.createMany({
    data: [
      { vendorId: northBooks.vendorId, schoolId: greenwood.schoolId },
      { vendorId: northBooks.vendorId, schoolId: riverside.schoolId },
      { vendorId: cityDepot.vendorId, schoolId: sunrise.schoolId }
    ]
  });

  await prisma.item.createMany({
    data: [
      {
        itemCode: "SW-01-ENG-01-10",
        itemName: "Safety Workbook Class 1",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "01",
        languageCode: "ENG",
        customisationCode: "01",
        customisationName: "CMS",
        editionCode: "10",
        mrp: "210.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "SW-02-ENG-01-10",
        itemName: "Safety Workbook Class 2",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "02",
        languageCode: "ENG",
        customisationCode: "01",
        customisationName: "CMS",
        editionCode: "10",
        mrp: "225.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "SW-03-ENG-01-10",
        itemName: "Safety Workbook Class 3",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "03",
        languageCode: "ENG",
        customisationCode: "01",
        customisationName: "CMS",
        editionCode: "10",
        mrp: "240.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "SW-01-ENG-02-10",
        itemName: "Safety Workbook Class 1",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "01",
        languageCode: "ENG",
        customisationCode: "02",
        customisationName: "AFS",
        editionCode: "10",
        mrp: "215.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "SW-02-ENG-02-10",
        itemName: "Safety Workbook Class 2",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "02",
        languageCode: "ENG",
        customisationCode: "02",
        customisationName: "AFS",
        editionCode: "10",
        mrp: "230.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "SW-01-ENG-03-09",
        itemName: "Safety Workbook Class 1",
        categoryCode: "SW",
        categoryType: "Safety Workbook",
        subCategoryCode: "01",
        languageCode: "ENG",
        customisationCode: "03",
        customisationName: "Pink",
        editionCode: "09",
        mrp: "205.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "PB-01-ENG-00-01",
        itemName: "Picture Booklet Level 1",
        categoryCode: "PB",
        categoryType: "Picture Booklet",
        subCategoryCode: "01",
        languageCode: "ENG",
        customisationCode: "00",
        customisationName: "Standard",
        editionCode: "01",
        mrp: "120.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "PB-02-ENG-00-01",
        itemName: "Picture Booklet Level 2",
        categoryCode: "PB",
        categoryType: "Picture Booklet",
        subCategoryCode: "02",
        languageCode: "ENG",
        customisationCode: "00",
        customisationName: "Standard",
        editionCode: "01",
        mrp: "125.00",
        obsolete: false,
        active: true
      },
      {
        itemCode: "PP-00-ENG-00-01",
        itemName: "Parenting Practices Booklet",
        categoryCode: "PP",
        categoryType: "Parenting Practices",
        subCategoryCode: "00",
        languageCode: "ENG",
        customisationCode: "00",
        customisationName: "Standard",
        editionCode: "01",
        mrp: "80.00",
        obsolete: false,
        active: true
      }
    ]
  });

  const descriptive = await prisma.orderSheet1.create({
    data: {
      orderNo: 1,
      subOrderNo: 0,
      sessionYear: "2026-2027",
      orderReceivedDate: date("2026-05-10"),
      expectedDeliveryDate: date("2026-05-25"),
      billingToType: "school",
      billingToCode: greenwood.schoolCode,
      billingToName: greenwood.schoolName,
      shippingToSummary: greenwood.schoolName,
      orderType: "descriptive",
      orderStatus: "finalized",
      pendingPayment: false,
      notes: "Clear school-wise quantities."
    }
  });

  const descriptiveRows = await Promise.all([
    prisma.orderSheet2A.create({
      data: {
        orderSheet1Id: descriptive.orderSheet1Id,
        orderNo: 1,
        subOrderNo: 0,
        schoolCode: greenwood.schoolCode,
        schoolName: greenwood.schoolName,
        itemCode: "SW-01-ENG-01-10",
        itemName: "Safety Workbook Class 1",
        quantity: 50
      }
    }),
    prisma.orderSheet2A.create({
      data: {
        orderSheet1Id: descriptive.orderSheet1Id,
        orderNo: 1,
        subOrderNo: 0,
        schoolCode: greenwood.schoolCode,
        schoolName: greenwood.schoolName,
        itemCode: "SW-02-ENG-01-10",
        itemName: "Safety Workbook Class 2",
        quantity: 40
      }
    })
  ]);

  await prisma.orderSheet3.createMany({
    data: descriptiveRows.map((row) => ({
      orderSheet1Id: descriptive.orderSheet1Id,
      orderNo: 1,
      subOrderNo: 0,
      sourceType: SourceType.TWO_A,
      sourceId: row.orderSheet2AId,
      itemCode: row.itemCode,
      itemName: row.itemName,
      quantity: row.quantity,
      parts: "complete",
      dispatchDate: date("2026-05-14"),
      feasibleDeliveryDate: date("2026-05-20"),
      possibleDeliveryDate: date("2026-05-22"),
      acceptedByClient: true,
      paymentReceived: true,
      cancelOrOnHoldStatus: "active"
    }))
  });

  const ambiguous = await prisma.orderSheet1.create({
    data: {
      orderNo: 2,
      subOrderNo: 0,
      sessionYear: "2026-2027",
      orderReceivedDate: date("2026-05-12"),
      expectedDeliveryDate: date("2026-05-30"),
      billingToType: "vendor",
      billingToCode: northBooks.vendorCode,
      billingToName: northBooks.vendorName,
      shippingToSummary: `${greenwood.schoolName}, ${riverside.schoolName}`,
      orderType: "ambiguous",
      orderStatus: "locked",
      booksellerType: northBooks.vendorType,
      booksellerRating: northBooks.vendorRating,
      pendingPayment: true,
      notes: "Vendor provided grouped quantities only."
    }
  });

  await prisma.orderSheet2B1.createMany({
    data: [
      {
        orderSheet1Id: ambiguous.orderSheet1Id,
        orderNo: 2,
        subOrderNo: 0,
        schoolCode: greenwood.schoolCode,
        schoolName: greenwood.schoolName
      },
      {
        orderSheet1Id: ambiguous.orderSheet1Id,
        orderNo: 2,
        subOrderNo: 0,
        schoolCode: riverside.schoolCode,
        schoolName: riverside.schoolName
      }
    ]
  });

  await prisma.orderSheet2B2.createMany({
    data: [
      {
        orderSheet1Id: ambiguous.orderSheet1Id,
        orderNo: 2,
        subOrderNo: 0,
        itemCode: "SW-01-ENG-01-10",
        itemName: "Safety Workbook Class 1",
        groupedQuantity: 120
      },
      {
        orderSheet1Id: ambiguous.orderSheet1Id,
        orderNo: 2,
        subOrderNo: 0,
        itemCode: "PB-01-ENG-00-01",
        itemName: "Picture Booklet Level 1",
        groupedQuantity: 300
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
