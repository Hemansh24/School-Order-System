"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createOrderAction, updateOrderAction } from "@/app/orders/actions";
import { Card, SubmitButton } from "@/components/ui";
import { compareEditionCodes, DEFAULT_LANGUAGE_CODE } from "@/lib/item-code";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";

type SchoolRef = {
  optionKey: string;
  schoolCode: string;
  schoolName: string;
  branchName: string | null;
};
type VendorRef = {
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  vendorRating: string | null;
  schools: SchoolRef[];
};
type ItemRef = {
  itemCode: string;
  itemName: string;
  categoryCode: string;
  categoryType: string | null;
  subCategoryCode: string;
  languageCode: string;
  customisationCode: string;
  customisationName: string | null;
  editionCode: string;
  mrp: string | null;
};

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
  const [selectedVendorSchoolKey, setSelectedVendorSchoolKey] = useState("");
  const [selectedDescriptiveSchoolKey, setSelectedDescriptiveSchoolKey] = useState("");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState(items[0]?.categoryCode ?? "");
  const [selectedCustomisationCode, setSelectedCustomisationCode] = useState(
    items[0]?.customisationCode ?? ""
  );
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  function findSchoolOptionByStoredValue(
    options: SchoolRef[],
    schoolCode?: string,
    schoolName?: string
  ) {
    if (!schoolCode && !schoolName) {
      return undefined;
    }

    return (
      options.find(
        (option) => option.schoolCode === schoolCode && option.schoolName === schoolName
      ) ?? options.find((option) => option.schoolCode === schoolCode)
    );
  }

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    mode: "onChange",
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
      descriptiveRows: [],
      ambiguousSchools: [],
      ambiguousItems: []
    }
  });

  const orderType = form.watch("sheet1.orderType");
  const billingToType = form.watch("sheet1.billingToType");
  const billingToCode = form.watch("sheet1.billingToCode");
  const watchedDescriptiveRows = form.watch("descriptiveRows");
  const watchedAmbiguousItems = form.watch("ambiguousItems");

  const descriptiveRows = useFieldArray({ control: form.control, name: "descriptiveRows" });
  const ambiguousSchools = useFieldArray({ control: form.control, name: "ambiguousSchools" });
  const ambiguousItems = useFieldArray({ control: form.control, name: "ambiguousItems" });

  const billingOptions = useMemo(
    () =>
      billingToType === "school"
        ? schools.map((school) => ({
            value: school.optionKey,
            code: school.schoolCode,
            name: school.schoolName,
            type: "",
            rating: ""
          }))
        : vendors.map((vendor) => ({
            value: vendor.vendorCode,
            code: vendor.vendorCode,
            name: vendor.vendorName,
            type: vendor.vendorType ?? "",
            rating: vendor.vendorRating ?? ""
          })),
    [billingToType, schools, vendors]
  );

  const selectedVendorSchools = useMemo(() => {
    if (billingToType !== "vendor") {
      return [];
    }

    return vendors.find((vendor) => vendor.vendorCode === billingToCode)?.schools ?? [];
  }, [billingToCode, billingToType, vendors]);

  const activeVendorSchoolKey = selectedVendorSchoolKey || selectedVendorSchools[0]?.optionKey || "";
  const activeVendorSchool = selectedVendorSchools.find(
    (school) => school.optionKey === activeVendorSchoolKey
  );
  const selectedBillingSchool =
    billingToType === "school"
      ? findSchoolOptionByStoredValue(schools, billingToCode, form.watch("sheet1.billingToName"))
      : undefined;
  const activeDescriptiveSchoolKey =
    billingToType === "vendor"
      ? activeVendorSchoolKey
      : selectedDescriptiveSchoolKey || selectedBillingSchool?.optionKey || schools[0]?.optionKey || "";
  const activeDescriptiveSchool =
    billingToType === "vendor"
      ? activeVendorSchool
      : schools.find((school) => school.optionKey === activeDescriptiveSchoolKey);

  useEffect(() => {
    if (billingToType === "school" && !selectedDescriptiveSchoolKey) {
      const current = findSchoolOptionByStoredValue(
        schools,
        form.getValues("sheet1.billingToCode"),
        form.getValues("sheet1.billingToName")
      );
      if (current) {
        setSelectedDescriptiveSchoolKey(current.optionKey);
      }
    }
  }, [billingToType, schools, selectedDescriptiveSchoolKey, form]);

  useEffect(() => {
    if (billingToType === "vendor" && !selectedVendorSchoolKey && selectedVendorSchools.length > 0) {
      const descriptiveRow = form.getValues("descriptiveRows")[0];
      const ambiguousSchool = form.getValues("ambiguousSchools")[0];
      const current = findSchoolOptionByStoredValue(
        selectedVendorSchools,
        descriptiveRow?.schoolCode ?? ambiguousSchool?.schoolCode,
        descriptiveRow?.schoolName ?? ambiguousSchool?.schoolName
      );
      setSelectedVendorSchoolKey(current?.optionKey ?? selectedVendorSchools[0].optionKey);
    }
  }, [billingToType, selectedVendorSchoolKey, selectedVendorSchools, form]);

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          items.map((item) => [
            item.categoryCode,
            { categoryCode: item.categoryCode, categoryType: item.categoryType }
          ])
        ).values()
      ),
    [items]
  );

  const customisationOptions = useMemo(
    () =>
      Array.from(
        new Map(
          items
            .filter((item) => item.categoryCode === selectedCategoryCode)
            .map((item) => [
              item.customisationCode,
              {
                customisationCode: item.customisationCode,
                customisationName: item.customisationName
              }
            ])
        ).values()
      ),
    [items, selectedCategoryCode]
  );

  const latestSelectionItems = useMemo(() => {
    const matchingItems = items.filter(
      (item) =>
        item.categoryCode === selectedCategoryCode &&
        item.customisationCode === selectedCustomisationCode &&
        item.languageCode === DEFAULT_LANGUAGE_CODE
    );
    const latestEditionCode = matchingItems
      .map((item) => item.editionCode)
      .sort(compareEditionCodes)
      .at(-1);

    return matchingItems
      .filter((item) => item.editionCode === latestEditionCode)
      .sort((left, right) =>
        left.subCategoryCode.localeCompare(right.subCategoryCode, undefined, { numeric: true }) ||
        left.itemName.localeCompare(right.itemName)
      );
  }, [items, selectedCategoryCode, selectedCustomisationCode]);

  useEffect(() => {
    if (
      categoryOptions.length > 0 &&
      !categoryOptions.some((option) => option.categoryCode === selectedCategoryCode)
    ) {
      setSelectedCategoryCode(categoryOptions[0].categoryCode);
    }
  }, [categoryOptions, selectedCategoryCode]);

  useEffect(() => {
    if (customisationOptions.length === 0) {
      if (selectedCustomisationCode) {
        setSelectedCustomisationCode("");
      }
      return;
    }

    if (!customisationOptions.some((option) => option.customisationCode === selectedCustomisationCode)) {
      setSelectedCustomisationCode(customisationOptions[0].customisationCode);
    }
  }, [customisationOptions, selectedCustomisationCode]);

  function setBilling(value: string) {
    const selected = billingOptions.find((option) => option.value === value);
    form.setValue("sheet1.billingToCode", selected?.code ?? "");
    form.setValue("sheet1.billingToName", selected?.name ?? "");
    form.setValue("sheet1.booksellerType", selected?.type ?? "");
    form.setValue("sheet1.booksellerRating", selected?.rating ?? "");
    if (billingToType === "vendor" && orderType === "descriptive") {
      form.setValue("descriptiveRows", []);
      setSelectedVendorSchoolKey("");
    }
    if (billingToType === "school") {
      setSelectedDescriptiveSchoolKey(value);
      form.setValue("sheet1.shippingToSummary", selected?.name ?? "");
    }
  }

  function setAmbiguousSchool(index: number, optionKey: string) {
    const selected = schools.find((school) => school.optionKey === optionKey);
    form.setValue(`ambiguousSchools.${index}.schoolCode`, selected?.schoolCode ?? "");
    form.setValue(`ambiguousSchools.${index}.schoolName`, selected?.schoolName ?? "");
  }

  function setDescriptiveItemQuantity(item: ItemRef, rawQuantity: string) {
    if (!activeDescriptiveSchool) {
      return;
    }

    const rows = form.getValues("descriptiveRows");
    const rowIndex = rows.findIndex(
      (row) =>
        row.schoolCode === activeDescriptiveSchool.schoolCode &&
        row.schoolName === activeDescriptiveSchool.schoolName &&
        row.itemCode === item.itemCode
    );
    const quantity = Number(rawQuantity);

    if (!rawQuantity || Number.isNaN(quantity) || quantity <= 0) {
      if (rowIndex >= 0) {
        descriptiveRows.remove(rowIndex);
      }
      return;
    }

    const nextRow = {
      schoolCode: activeDescriptiveSchool.schoolCode,
      schoolName: activeDescriptiveSchool.schoolName,
      itemCode: item.itemCode,
      itemName: item.itemName,
      quantity,
      notes: ""
    };

    if (rowIndex >= 0) {
      form.setValue(`descriptiveRows.${rowIndex}`, nextRow);
    } else {
      descriptiveRows.append(nextRow);
    }
  }

  function setAmbiguousItemQuantity(item: ItemRef, rawQuantity: string) {
    const rows = form.getValues("ambiguousItems");
    const rowIndex = rows.findIndex((row) => row.itemCode === item.itemCode);
    const quantity = Number(rawQuantity);

    if (!rawQuantity || Number.isNaN(quantity) || quantity <= 0) {
      if (rowIndex >= 0) {
        ambiguousItems.remove(rowIndex);
      }
      return;
    }

    const nextRow = {
      itemCode: item.itemCode,
      itemName: item.itemName,
      groupedQuantity: quantity,
      notes: ""
    };

    if (rowIndex >= 0) {
      form.setValue(`ambiguousItems.${rowIndex}`, nextRow);
    } else {
      ambiguousItems.append(nextRow);
    }
  }

  function moveVendorSchool(direction: -1 | 1) {
    if (selectedVendorSchools.length === 0) {
      return;
    }

    const currentIndex = Math.max(
      0,
      selectedVendorSchools.findIndex((school) => school.optionKey === activeVendorSchoolKey)
    );
    const nextIndex = Math.min(
      selectedVendorSchools.length - 1,
      Math.max(0, currentIndex + direction)
    );
    setSelectedVendorSchoolKey(selectedVendorSchools[nextIndex].optionKey);
  }

  function switchOrderType(type: "descriptive" | "ambiguous") {
    form.setValue("sheet1.orderType", type);
    if (type === "descriptive") {
      form.setValue("ambiguousSchools", []);
      form.setValue("ambiguousItems", []);
      if (billingToType !== "vendor" && form.getValues("descriptiveRows").length === 0) {
        setSelectedDescriptiveSchoolKey(
          findSchoolOptionByStoredValue(
            schools,
            form.getValues("sheet1.billingToCode"),
            form.getValues("sheet1.billingToName")
          )?.optionKey ?? schools[0]?.optionKey ?? ""
        );
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

  async function goNext() {
    if (step === 3) {
      const isValid = await form.trigger();
      if (!isValid) {
        return;
      }
    }

    setStep((current) => Math.min(4, current + 1));
  }

  const errors = form.formState.errors;
  const canSubmit = step === 4 && form.formState.isValid && !isPending;

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
                    form.setValue("sheet1.shippingToSummary", first?.schoolName ?? "");
                    if (orderType === "descriptive") {
                      form.setValue("descriptiveRows", []);
                      setSelectedVendorSchoolKey("");
                      setSelectedDescriptiveSchoolKey(nextType === "school" ? schools[0]?.optionKey ?? "" : "");
                    }
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
                value={
                  billingToType === "school"
                    ? selectedBillingSchool?.optionKey ?? schools[0]?.optionKey ?? ""
                    : form.watch("sheet1.billingToCode")
                }
                onChange={(event) => setBilling(event.target.value)}
              >
                {billingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
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
          <div className="mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Order Sheet 2A</h2>
              <p className="text-sm text-muted">School-wise item quantities for descriptive orders.</p>
            </div>
          </div>
          <div className="space-y-4">
            {billingToType === "vendor" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Field label="School">
                  <select
                    className={inputClass}
                    value={activeVendorSchoolKey}
                    onChange={(event) => setSelectedVendorSchoolKey(event.target.value)}
                  >
                    {selectedVendorSchools.map((school) => (
                      <option key={school.optionKey} value={school.optionKey}>
                        {school.schoolCode} - {school.schoolName}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <SubmitButton
                    type="button"
                    variant="secondary"
                    onClick={() => moveVendorSchool(-1)}
                    disabled={
                      selectedVendorSchools.findIndex(
                        (school) => school.optionKey === activeVendorSchoolKey
                      ) <= 0
                    }
                  >
                    Previous School
                  </SubmitButton>
                  <SubmitButton
                    type="button"
                    variant="secondary"
                    onClick={() => moveVendorSchool(1)}
                    disabled={
                      selectedVendorSchools.findIndex(
                        (school) => school.optionKey === activeVendorSchoolKey
                      ) >= selectedVendorSchools.length - 1
                    }
                  >
                    Next School
                  </SubmitButton>
                </div>
              </div>
            ) : (
              <Field label="School">
                <select
                  className={inputClass}
                  value={activeDescriptiveSchoolKey}
                  onChange={(event) => setSelectedDescriptiveSchoolKey(event.target.value)}
                >
                  {schools.map((school) => (
                    <option key={school.optionKey} value={school.optionKey}>
                      {school.schoolCode} - {school.schoolName}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {billingToType === "vendor" && selectedVendorSchools.length === 0 ? (
              <div className="rounded-md border border-danger bg-red-50 p-3 text-sm text-red-900">
                This vendor is not linked to any schools yet.
              </div>
            ) : (
              <>
                <ItemSelectionFilters
                  categories={categoryOptions}
                  customisations={customisationOptions}
                  categoryCode={selectedCategoryCode}
                  customisationCode={selectedCustomisationCode}
                  onCategoryChange={setSelectedCategoryCode}
                  onCustomisationChange={setSelectedCustomisationCode}
                />
                <ItemQuantityTable
                  items={latestSelectionItems}
                  quantityForItem={(item) =>
                    watchedDescriptiveRows.find(
                      (entry) =>
                        entry.schoolCode === activeDescriptiveSchool?.schoolCode &&
                        entry.schoolName === activeDescriptiveSchool?.schoolName &&
                        entry.itemCode === item.itemCode
                    )?.quantity
                  }
                  onQuantityChange={setDescriptiveItemQuantity}
                />
              </>
            )}
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
                      value={
                        findSchoolOptionByStoredValue(
                          schools,
                          form.watch(`ambiguousSchools.${index}.schoolCode`),
                          form.watch(`ambiguousSchools.${index}.schoolName`)
                        )?.optionKey ?? schools[0]?.optionKey ?? ""
                      }
                      onChange={(event) => setAmbiguousSchool(index, event.target.value)}
                    >
                      {schools.map((school) => (
                        <option key={school.optionKey} value={school.optionKey}>
                          {school.schoolCode} - {school.schoolName}
                        </option>
                      ))}
                    </select>
                  </LineRow>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3">
                <h3 className="font-semibold text-ink">Order Sheet 2B2 Grouped Items</h3>
              </div>
              <ItemSelectionFilters
                categories={categoryOptions}
                customisations={customisationOptions}
                categoryCode={selectedCategoryCode}
                customisationCode={selectedCustomisationCode}
                onCategoryChange={setSelectedCategoryCode}
                onCustomisationChange={setSelectedCustomisationCode}
              />
              <div className="mt-4">
                <ItemQuantityTable
                  items={latestSelectionItems}
                  quantityForItem={(item) =>
                    watchedAmbiguousItems.find((entry) => entry.itemCode === item.itemCode)
                      ?.groupedQuantity
                  }
                  onQuantityChange={setAmbiguousItemQuantity}
                />
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
          {!form.formState.isValid ? (
            <div className="mt-4 rounded-md border border-danger bg-red-50 p-3 text-sm text-red-900">
              Complete the required Sheet 1 and detail row fields before saving this order.
            </div>
          ) : null}
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
            onClick={goNext}
            disabled={step === 4}
          >
            Next
          </SubmitButton>
          {step === 4 ? (
            <SubmitButton type="submit" disabled={!canSubmit}>
              {isPending ? "Saving..." : submitLabel}
            </SubmitButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function ItemSelectionFilters({
  categories,
  customisations,
  categoryCode,
  customisationCode,
  onCategoryChange,
  onCustomisationChange
}: {
  categories: { categoryCode: string; categoryType: string | null }[];
  customisations: { customisationCode: string; customisationName: string | null }[];
  categoryCode: string;
  customisationCode: string;
  onCategoryChange: (value: string) => void;
  onCustomisationChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Category">
        <select
          className={inputClass}
          value={categoryCode}
          disabled={categories.length === 0}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categories.length === 0 ? <option value="">No categories available</option> : null}
          {categories.map((category) => (
            <option key={category.categoryCode} value={category.categoryCode}>
              {category.categoryCode}
              {category.categoryType ? ` - ${category.categoryType}` : ""}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Customization">
        <select
          className={inputClass}
          value={customisationCode}
          disabled={customisations.length === 0}
          onChange={(event) => onCustomisationChange(event.target.value)}
        >
          {customisations.length === 0 ? (
            <option value="">No customizations available</option>
          ) : null}
          {customisations.map((customisation) => (
            <option key={customisation.customisationCode} value={customisation.customisationCode}>
              {customisation.customisationName ?? customisation.customisationCode}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function ItemQuantityTable({
  items,
  quantityForItem,
  onQuantityChange
}: {
  items: ItemRef[];
  quantityForItem: (item: ItemRef) => number | undefined;
  onQuantityChange: (item: ItemRef, rawQuantity: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-line bg-canvas p-3 text-sm text-muted">
        No active English items were found for this category and customization.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Class / Grade</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Customization</th>
            <th className="px-4 py-3">Language</th>
            <th className="px-4 py-3">Edition</th>
            <th className="px-4 py-3">MRP</th>
            <th className="w-36 px-4 py-3">Quantity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.itemCode}>
              <td className="px-4 py-3">
                <span className="font-medium text-ink">{item.itemName}</span>
                <span className="block text-xs text-muted">{item.itemCode}</span>
              </td>
              <td className="px-4 py-3 text-muted">
                <span className="font-medium text-ink">{item.subCategoryCode}</span>
                <span className="block text-xs">{item.subCategoryCode}</span>
              </td>
              <td className="px-4 py-3 text-muted">{item.categoryCode}</td>
              <td className="px-4 py-3 text-muted">
                <span className="font-medium text-ink">
                  {item.customisationName ?? item.customisationCode}
                </span>
                <span className="block text-xs">{item.customisationCode}</span>
              </td>
              <td className="px-4 py-3 text-muted">{item.languageCode}</td>
              <td className="px-4 py-3 text-muted">{item.editionCode}</td>
              <td className="px-4 py-3 text-muted">{item.mrp ?? ""}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={quantityForItem(item) ?? ""}
                  onChange={(event) => onQuantityChange(item, event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
