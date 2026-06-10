import { notFound, redirect } from "next/navigation";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";
import { getReferenceData } from "@/lib/services/reference";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";
import type { CreateOrderInput } from "@/lib/validation/orders";

export const dynamic = "force-dynamic";

function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toSchoolOptions(
  schools: Array<{
    schoolCode: string;
    schoolName: string;
    address: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
  }>
): Array<{
  optionKey: string;
  schoolCode: string;
  schoolName: string;
  addressSummary: string;
}> {
  return schools.map((school) => ({
    optionKey: school.schoolCode,
    schoolCode: school.schoolCode,
    schoolName: school.schoolName,
    addressSummary: formatSchoolAddress(school)
  }));
}

export default async function EditOrderPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) {
    notFound();
  }

  if (
    order.orderStatus !== "draft" &&
    order.orderStatus !== "revision_requested" &&
    order.orderStatus !== "pending_confirmation"
  ) {
    redirect(`/orders/${order.orderSheet1Id}`);
  }

  const reference = await getReferenceData();
  const initialValues: CreateOrderInput = {
    sheet1: {
      sessionYear: order.sessionYear,
      orderReceivedDate: toInputDate(order.orderReceivedDate),
      expectedDeliveryDate: toInputDate(order.expectedDeliveryDate),
      billingToType: order.billingToType,
      billingToCode: order.billingToCode,
      billingToName: order.billingToName,
      shippingToType: order.shippingToType,
      shippingToCode: order.shippingToCode,
      shippingToName: order.shippingToName,
      shippingToSummary: order.shippingToSummary,
      orderType: order.orderType,
      booksellerType: order.booksellerType ?? "",
      booksellerRating: order.booksellerRating ?? "",
      pendingPayment: order.pendingPayment,
      notes: order.notes ?? ""
    },
    descriptiveRows:
      order.orderType === "descriptive"
        ? order.descriptiveRows.map((row) => ({
            schoolCode: row.schoolCode,
            schoolName: row.schoolName,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: row.quantity,
            notes: row.notes ?? ""
          }))
        : [],
    ambiguousSchools:
      order.orderType === "ambiguous"
        ? order.ambiguousSchools.map((row) => ({
            schoolCode: row.schoolCode,
            schoolName: row.schoolName,
            notes: row.notes ?? ""
          }))
        : [],
    ambiguousItems:
      order.orderType === "ambiguous"
        ? order.ambiguousItems.map((row) => ({
            itemCode: row.itemCode,
            itemName: row.itemName,
            groupedQuantity: row.groupedQuantity,
            notes: row.notes ?? ""
          }))
        : []
  };

  return (
    <>
      <PageHeader
        title={`Edit Order ${order.subOrderNo > 0 ? `${order.orderNo}.${order.subOrderNo}` : order.orderNo}`}
        description="Update the draft or revision before locking it."
      />
      <CreateOrderForm
        schools={toSchoolOptions(reference.schools)}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
          addressSummary: formatVendorAddress(vendor.address),
          schools: toSchoolOptions(vendor.vendorSchools.map((row) => row.school))
        }))}
        items={reference.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          categoryCode: item.categoryCode,
          categoryType: item.categoryType,
          subCategoryCode: item.subCategoryCode,
          languageCode: item.languageCode,
          customisationCode: item.customisationCode,
          customisationName: item.customisationName,
          editionCode: item.editionCode,
          mrp: item.mrp?.toString() ?? null
        }))}
        initialValues={initialValues}
        orderSheet1Id={order.orderSheet1Id}
        submitLabel="Save Changes"
      />
    </>
  );
}
