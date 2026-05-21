"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createOrderAction, updateOrderAction } from "@/app/orders/actions";
import { Card, SubmitButton } from "@/components/ui";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";

type SchoolRef = { schoolCode: string; schoolName: string };
type VendorRef = {
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  vendorRating: string | null;
  schools: SchoolRef[];
};
type ItemRef = { itemCode: string; itemName: string };

type Props = {
  schools: SchoolRef[];
  vendors: VendorRef[];
  items: ItemRef[];
  initialValues?: CreateOrderInput;
  orderSheet1Id?: number;
  submitLabel?: string;
};

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const textAreaClass =
  "focus-ring min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";

export function CreateOrderForm({
  schools,
  vendors,
  items,
  initialValues,
  orderSheet1Id,
  submitLabel = "Create Order"
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: initialValues ?? {
      sheet1: {
        sessionYear: "2026-2027",
        orderReceivedDate: today,
        expectedDeliveryDate: nextWeek,
        billingToType: "school",
        billingToCode: schools[0]?.schoolCode ?? "",
        billingToName: schools[0]?.schoolName ?? "",
        shippingToSummary: schools[0]?.schoolName ?? "",
        orderType: "descriptive",
        booksellerType: "",
        booksellerRating: "",
        pendingPayment: false,
        notes: ""
      },
      descriptiveRows: [
        {
          schoolCode: schools[0]?.schoolCode ?? "",
          schoolName: schools[0]?.schoolName ?? "",
          itemCode: items[0]?.itemCode ?? "",
          itemName: items[0]?.itemName ?? "",
          quantity: 1,
          notes: ""
        }
      ],
      ambiguousSchools: [],
      ambiguousItems: []
    }
  });

  const orderType = form.watch("sheet1.orderType");
  const billingToType = form.watch("sheet1.billingToType");

  const descriptiveRows = useFieldArray({ control: form.control, name: "descriptiveRows" });
  const ambiguousSchools = useFieldArray({ control: form.control, name: "ambiguousSchools" });
  const ambiguousItems = useFieldArray({ control: form.control, name: "ambiguousItems" });

  const billingOptions = useMemo(
    () =>
      billingToType === "school"
        ? schools.map((school) => ({
            code: school.schoolCode,
            name: school.schoolName,
            type: "",
            rating: ""
          }))
        : vendors.map((vendor) => ({
            code: vendor.vendorCode,
            name: vendor.vendorName,
            type: vendor.vendorType ?? "",
            rating: vendor.vendorRating ?? ""
          })),
    [billingToType, schools, vendors]
  );

  function setBilling(code: string) {
    const selected = billingOptions.find((option) => option.code === code);
    form.setValue("sheet1.billingToCode", code);
    form.setValue("sheet1.billingToName", selected?.name ?? "");
    form.setValue("sheet1.booksellerType", selected?.type ?? "");
    form.setValue("sheet1.booksellerRating", selected?.rating ?? "");
  }

  function setDescriptiveSchool(index: number, code: string) {
    const selected = schools.find((school) => school.schoolCode === code);
    form.setValue(`descriptiveRows.${index}.schoolCode`, code);
    form.setValue(`descriptiveRows.${index}.schoolName`, selected?.schoolName ?? "");
  }

  function setAmbiguousSchool(index: number, code: string) {
    const selected = schools.find((school) => school.schoolCode === code);
    form.setValue(`ambiguousSchools.${index}.schoolCode`, code);
    form.setValue(`ambiguousSchools.${index}.schoolName`, selected?.schoolName ?? "");
  }

  function setItem(path: "descriptiveRows" | "ambiguousItems", index: number, code: string) {
    const selected = items.find((item) => item.itemCode === code);
    form.setValue(`${path}.${index}.itemCode`, code);
    form.setValue(`${path}.${index}.itemName`, selected?.itemName ?? "");
  }

  function switchOrderType(type: "descriptive" | "ambiguous") {
    form.setValue("sheet1.orderType", type);
    if (type === "descriptive") {
      form.setValue("ambiguousSchools", []);
      form.setValue("ambiguousItems", []);
      if (form.getValues("descriptiveRows").length === 0) {
        descriptiveRows.append({
          schoolCode: schools[0]?.schoolCode ?? "",
          schoolName: schools[0]?.schoolName ?? "",
          itemCode: items[0]?.itemCode ?? "",
          itemName: items[0]?.itemName ?? "",
          quantity: 1,
          notes: ""
        });
      }
    } else {
      form.setValue("descriptiveRows", []);
      if (form.getValues("ambiguousSchools").length === 0) {
        ambiguousSchools.append({
          schoolCode: schools[0]?.schoolCode ?? "",
          schoolName: schools[0]?.schoolName ?? "",
          notes: ""
        });
      }
      if (form.getValues("ambiguousItems").length === 0) {
        ambiguousItems.append({
          itemCode: items[0]?.itemCode ?? "",
          itemName: items[0]?.itemName ?? "",
          groupedQuantity: 1,
          notes: ""
        });
      }
    }
  }

  async function submit(values: CreateOrderInput) {
    setServerError(null);
    startTransition(async () => {
      const result =
        orderSheet1Id === undefined
          ? await createOrderAction(values)
          : await updateOrderAction(orderSheet1Id, values);
      if (!result.ok) {
        setServerError(result.message ?? "Could not create order.");
        return;
      }
      router.push(`/orders/${result.orderSheet1Id}`);
      router.refresh();
    });
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {["Order Sheet 1", orderType === "descriptive" ? "Order Sheet 2A" : "Order Sheet 2B1 + 2B2", "Review", "Lock/Finalize"].map(
          (label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index + 1)}
              className={`focus-ring rounded-md border px-3 py-2 text-left text-sm font-semibold ${
                step === index + 1
                  ? "border-brand bg-brand-soft text-ink"
                  : "border-line bg-white text-muted"
              }`}
            >
              <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white text-xs">
                {index + 1}
              </span>
              {label}
            </button>
          )
        )}
      </div>

      {serverError ? (
        <div className="rounded-md border border-danger bg-red-50 p-3 text-sm text-red-900">
          {serverError}
        </div>
      ) : null}

      {step === 1 ? (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-ink">Order Sheet 1</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Session Year" error={errors.sheet1?.sessionYear?.message}>
              <input className={inputClass} {...form.register("sheet1.sessionYear")} />
            </Field>
            <Field label="Order Received Date" error={errors.sheet1?.orderReceivedDate?.message}>
              <input type="date" className={inputClass} {...form.register("sheet1.orderReceivedDate")} />
            </Field>
            <Field label="Expected Delivery Date" error={errors.sheet1?.expectedDeliveryDate?.message}>
              <input type="date" className={inputClass} {...form.register("sheet1.expectedDeliveryDate")} />
            </Field>
            <Field label="Billing To Type">
              <select
                className={inputClass}
                {...form.register("sheet1.billingToType", {
                  onChange: (event) => {
                    const nextType = event.target.value as "school" | "vendor";
                    const first =
                      nextType === "school"
                        ? schools[0]
                        : vendors[0]
                          ? { schoolCode: vendors[0].vendorCode, schoolName: vendors[0].vendorName }
                          : undefined;
                    form.setValue("sheet1.billingToCode", first?.schoolCode ?? "");
                    form.setValue("sheet1.billingToName", first?.schoolName ?? "");
                  }
                })}
              >
                <option value="school">School</option>
                <option value="vendor">Vendor / Bookseller</option>
              </select>
            </Field>
            <Field label="Billing To Code/Name" error={errors.sheet1?.billingToCode?.message}>
              <select
                className={inputClass}
                value={form.watch("sheet1.billingToCode")}
                onChange={(event) => setBilling(event.target.value)}
              >
                {billingOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Order Type" error={errors.sheet1?.orderType?.message}>
              <select
                className={inputClass}
                value={orderType}
                onChange={(event) => switchOrderType(event.target.value as "descriptive" | "ambiguous")}
              >
                <option value="descriptive">Descriptive</option>
                <option value="ambiguous">Ambiguous</option>
              </select>
            </Field>
            <Field label="Bookseller Type">
              <input className={inputClass} {...form.register("sheet1.booksellerType")} />
            </Field>
            <Field label="Bookseller Rating">
              <input className={inputClass} {...form.register("sheet1.booksellerRating")} />
            </Field>
            <label className="mt-6 flex h-10 items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" className="h-4 w-4" {...form.register("sheet1.pendingPayment")} />
              Pending payment
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Shipping To Summary" error={errors.sheet1?.shippingToSummary?.message}>
              <textarea className={textAreaClass} {...form.register("sheet1.shippingToSummary")} />
            </Field>
            <Field label="Notes">
              <textarea className={textAreaClass} {...form.register("sheet1.notes")} />
            </Field>
          </div>
        </Card>
      ) : null}

      {step === 2 && orderType === "descriptive" ? (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Order Sheet 2A</h2>
              <p className="text-sm text-muted">School-wise item quantities for descriptive orders.</p>
            </div>
            <SubmitButton
              type="button"
              variant="secondary"
              onClick={() =>
                descriptiveRows.append({
                  schoolCode: schools[0]?.schoolCode ?? "",
                  schoolName: schools[0]?.schoolName ?? "",
                  itemCode: items[0]?.itemCode ?? "",
                  itemName: items[0]?.itemName ?? "",
                  quantity: 1,
                  notes: ""
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add row
            </SubmitButton>
          </div>
          <div className="space-y-3">
            {descriptiveRows.fields.map((field, index) => (
              <LineRow key={field.id} onRemove={() => descriptiveRows.remove(index)}>
                <select
                  className={inputClass}
                  value={form.watch(`descriptiveRows.${index}.schoolCode`)}
                  onChange={(event) => setDescriptiveSchool(index, event.target.value)}
                >
                  {schools.map((school) => (
                    <option key={school.schoolCode} value={school.schoolCode}>
                      {school.schoolCode} - {school.schoolName}
                    </option>
                  ))}
                </select>
                <select
                  className={inputClass}
                  value={form.watch(`descriptiveRows.${index}.itemCode`)}
                  onChange={(event) => setItem("descriptiveRows", index, event.target.value)}
                >
                  {items.map((item) => (
                    <option key={item.itemCode} value={item.itemCode}>
                      {item.itemCode} - {item.itemName}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  {...form.register(`descriptiveRows.${index}.quantity`)}
                />
              </LineRow>
            ))}
          </div>
        </Card>
      ) : null}

      {step === 2 && orderType === "ambiguous" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Ambiguous Entry</h2>
          <p className="mb-4 text-sm text-muted">
            Schools are recorded in Sheet 2B1. Grouped item quantities are recorded in Sheet 2B2.
          </p>
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">Order Sheet 2B1 Schools</h3>
                <SubmitButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    ambiguousSchools.append({
                      schoolCode: schools[0]?.schoolCode ?? "",
                      schoolName: schools[0]?.schoolName ?? "",
                      notes: ""
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add school
                </SubmitButton>
              </div>
              <div className="space-y-3">
                {ambiguousSchools.fields.map((field, index) => (
                  <LineRow key={field.id} onRemove={() => ambiguousSchools.remove(index)}>
                    <select
                      className={inputClass}
                      value={form.watch(`ambiguousSchools.${index}.schoolCode`)}
                      onChange={(event) => setAmbiguousSchool(index, event.target.value)}
                    >
                      {schools.map((school) => (
                        <option key={school.schoolCode} value={school.schoolCode}>
                          {school.schoolCode} - {school.schoolName}
                        </option>
                      ))}
                    </select>
                  </LineRow>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">Order Sheet 2B2 Grouped Items</h3>
                <SubmitButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    ambiguousItems.append({
                      itemCode: items[0]?.itemCode ?? "",
                      itemName: items[0]?.itemName ?? "",
                      groupedQuantity: 1,
                      notes: ""
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add item
                </SubmitButton>
              </div>
              <div className="space-y-3">
                {ambiguousItems.fields.map((field, index) => (
                  <LineRow key={field.id} onRemove={() => ambiguousItems.remove(index)}>
                    <select
                      className={inputClass}
                      value={form.watch(`ambiguousItems.${index}.itemCode`)}
                      onChange={(event) => setItem("ambiguousItems", index, event.target.value)}
                    >
                      {items.map((item) => (
                        <option key={item.itemCode} value={item.itemCode}>
                          {item.itemCode} - {item.itemName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      {...form.register(`ambiguousItems.${index}.groupedQuantity`)}
                    />
                  </LineRow>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-ink">Review</h2>
          <ReviewBlock values={form.getValues()} />
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Lock/Finalize</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Creating this order saves it as a draft with the correct sheet rows. Open the order
            details page to lock it, then finalize it into Order Sheet 3. Finalized orders are
            handled through the sub-order/revision workflow.
          </p>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {Object.keys(errors).length > 0 ? "Resolve validation errors before submitting." : null}
        </div>
        <div className="flex gap-2">
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1}
          >
            Back
          </SubmitButton>
          <SubmitButton
            type="button"
            variant="secondary"
            onClick={() => setStep((current) => Math.min(4, current + 1))}
            disabled={step === 4}
          >
            Next
          </SubmitButton>
          <SubmitButton type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function LineRow({
  children,
  onRemove
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-line bg-canvas p-3 md:grid-cols-[1fr_1fr_140px_44px]">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-red-700"
        title="Remove row"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ReviewBlock({ values }: { values: CreateOrderInput }) {
  return (
    <div className="grid gap-4 text-sm xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-md border border-line bg-canvas p-4">
        <p className="font-semibold text-ink">Sheet 1</p>
        <p className="mt-2 text-muted">Billing: {values.sheet1.billingToName}</p>
        <p className="text-muted">Shipping: {values.sheet1.shippingToSummary}</p>
        <p className="text-muted">Type: {values.sheet1.orderType}</p>
      </div>
      <div className="rounded-md border border-line bg-canvas p-4">
        <p className="font-semibold text-ink">Detail rows</p>
        {values.sheet1.orderType === "descriptive" ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="pb-2 pr-3">School</th>
                  <th className="pb-2 pr-3">Item</th>
                  <th className="pb-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {values.descriptiveRows.map((row, index) => (
                  <tr key={`${row.schoolCode}-${row.itemCode}-${index}`}>
                    <td className="py-2 pr-3">
                      <span className="font-medium text-ink">{row.schoolCode}</span>
                      <span className="block text-muted">{row.schoolName}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="font-medium text-ink">{row.itemCode}</span>
                      <span className="block text-muted">{row.itemName}</span>
                    </td>
                    <td className="py-2 text-right font-semibold text-ink">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Sheet 2B1 Schools</p>
              <div className="mt-2 space-y-2">
                {values.ambiguousSchools.map((row, index) => (
                  <div key={`${row.schoolCode}-${index}`} className="rounded-md border border-line bg-white px-3 py-2">
                    <span className="font-medium text-ink">{row.schoolCode}</span>
                    <span className="ml-2 text-muted">{row.schoolName}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Sheet 2B2 Grouped Items</p>
              <div className="mt-2 space-y-2">
                {values.ambiguousItems.map((row, index) => (
                  <div
                    key={`${row.itemCode}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2"
                  >
                    <span>
                      <span className="font-medium text-ink">{row.itemCode}</span>
                      <span className="block text-muted">{row.itemName}</span>
                    </span>
                    <span className="font-semibold text-ink">{row.groupedQuantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
