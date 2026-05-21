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
  await prisma.school.deleteMany();
  await prisma.item.deleteMany();

  const [greenwood, riverside, sunrise] = await Promise.all([
    prisma.school.create({
      data: {
        schoolCode: "SCH-001",
        schoolName: "Greenwood Public School",
        address: "Sector 14",
        contactPerson: "Anita Rao",
        phone: "9876500011",
        email: "admin@greenwood.example"
      }
    }),
    prisma.school.create({
      data: {
        schoolCode: "SCH-002",
        schoolName: "Riverside International School",
        address: "Lake Road",
        contactPerson: "Kabir Sen",
        phone: "9876500022",
        email: "orders@riverside.example"
      }
    }),
    prisma.school.create({
      data: {
        schoolCode: "SCH-003",
        schoolName: "Sunrise Model School",
        address: "MG Avenue",
        contactPerson: "Meera Das",
        phone: "9876500033",
        email: "office@sunrise.example"
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
        itemCode: "BK-MATH-06",
        itemName: "Mathematics Coursebook 6",
        itemType: "book",
        subject: "Mathematics",
        classLevel: "6",
        publisher: "Scholastic House",
        price: "320.00"
      },
      {
        itemCode: "BK-SCI-07",
        itemName: "Science Explorer 7",
        itemType: "book",
        subject: "Science",
        classLevel: "7",
        publisher: "Learning Press",
        price: "345.00"
      },
      {
        itemCode: "NB-STD",
        itemName: "Standard Notebook Pack",
        itemType: "stationery",
        subject: "General",
        classLevel: "All",
        publisher: "Campus Supplies",
        price: "90.00"
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
        itemCode: "BK-MATH-06",
        itemName: "Mathematics Coursebook 6",
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
        itemCode: "BK-SCI-07",
        itemName: "Science Explorer 7",
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
        itemCode: "BK-MATH-06",
        itemName: "Mathematics Coursebook 6",
        groupedQuantity: 120
      },
      {
        orderSheet1Id: ambiguous.orderSheet1Id,
        orderNo: 2,
        subOrderNo: 0,
        itemCode: "NB-STD",
        itemName: "Standard Notebook Pack",
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
