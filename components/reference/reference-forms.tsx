"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createItemAction, updateItemAction } from "@/app/items/actions";
import type { ReferenceActionState as ItemActionState } from "@/app/items/actions";
import { createSchoolAction, updateSchoolAction } from "@/app/schools/actions";
import type { ReferenceActionState as SchoolActionState } from "@/app/schools/actions";
import { createVendorAction, updateVendorAction } from "@/app/vendors/actions";
import type { ReferenceActionState as VendorActionState } from "@/app/vendors/actions";
import { Card, SubmitButton } from "@/components/ui";
import { DEFAULT_LANGUAGE_CODE, generateItemCode } from "@/lib/item-code";

type SchoolOption = {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
};

type SchoolFormValues = {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
};

type VendorFormValues = {
  vendorId: number;
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  vendorRating: string | null;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  schoolIds: number[];
};

type ItemFormValues = {
  itemId: number;
  itemCode: string;
  itemName: string;
  categoryCode: string;
  categoryType: string | null;
  subCategoryCode: string;
  languageCode: string;
  customisationCode: string;
  customisationName: string | null;
  editionCode: string;
  isbnNumber: string | null;
  mrp: string | null;
  obsolete: boolean;
  active: boolean;
};

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";
const initialState = { ok: false } satisfies SchoolActionState;

export function AddSchoolForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<SchoolActionState, FormData>(
    createSchoolAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <ReferenceForm ref={formRef} action={action} title="Add School" state={state}>
      <TextField
        name="schoolCode"
        label="Code"
        defaultValue="Assigned from PT/PR"
        helpText="Saved from the matching organisation PT code, falling back to PR code."
        readOnly
      />
      <TextField
        name="schoolName"
        label="Name"
        required
        placeholder="Greenwood Public School"
      />
      <TextField name="address" label="Address" placeholder="Sector 14, Block A" />
      <TextField name="district" label="District" placeholder="Gautam Buddh Nagar" />
      <TextField name="state" label="State" placeholder="Uttar Pradesh" />
      <TextField name="pincode" label="Pincode" placeholder="201301" />
      <TextField name="contactPerson" label="Contact" placeholder="Anita Rao" />
      <TextField name="phone" label="Phone" placeholder="9876500011" />
      <TextField name="email" label="Email" placeholder="admin@school.example" />
      <SchoolCodeResult state={state} />
      <FormSubmit>Add School</FormSubmit>
    </ReferenceForm>
  );
}

export function EditSchoolForm({ school }: { school: SchoolFormValues }) {
  const [state, action] = useActionState<SchoolActionState, FormData>(
    updateSchoolAction.bind(null, school.schoolId),
    initialState
  );

  return (
    <ReferenceForm action={action} title="Edit School" state={state}>
      <TextField
        name="schoolCode"
        label="PT/PR Code"
        required
        defaultValue={school.schoolCode}
        helpText="Organisation PT code, falling back to PR code."
        readOnly
      />
      <TextField
        name="schoolName"
        label="Name"
        required
        defaultValue={school.schoolName}
        placeholder="Greenwood Public School"
      />
      <TextField name="address" label="Address" defaultValue={school.address} placeholder="Sector 14, Block A" />
      <TextField name="district" label="District" defaultValue={school.district} placeholder="Gautam Buddh Nagar" />
      <TextField name="state" label="State" defaultValue={school.state} placeholder="Uttar Pradesh" />
      <TextField name="pincode" label="Pincode" defaultValue={school.pincode} placeholder="201301" />
      <TextField name="contactPerson" label="Contact" defaultValue={school.contactPerson} placeholder="Anita Rao" />
      <TextField name="phone" label="Phone" defaultValue={school.phone} placeholder="9876500011" />
      <TextField name="email" label="Email" defaultValue={school.email} placeholder="admin@school.example" />
      <FormSubmit>Save School</FormSubmit>
    </ReferenceForm>
  );
}

export function AddVendorForm({
  schools,
  nextCode
}: {
  schools: SchoolOption[];
  nextCode: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>([]);
  const [state, action] = useActionState<VendorActionState, FormData>(
    createVendorAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setSelectedSchoolIds([]);
    }
  }, [state.ok]);

  return (
    <ReferenceForm ref={formRef} action={action} title="Add Vendor" state={state}>
      <TextField
        name="vendorCode"
        label="Code"
        required
        defaultValue={nextCode}
        placeholder="VEN-001"
        helpText="Auto-generated from the latest vendor code."
        readOnly
      />
      <TextField name="vendorName" label="Name" required placeholder="North Booksellers" />
      <TextField name="vendorType" label="Type" placeholder="regional distributor" />
      <TextField name="vendorRating" label="Rating" placeholder="A" />
      <TextField name="contactPerson" label="Contact" placeholder="Raghav Mehta" />
      <TextField name="phone" label="Phone" placeholder="9000011111" />
      <TextField name="email" label="Email" placeholder="ops@vendor.example" />
      <TextField name="address" label="Address" placeholder="Market Road" />
      <SchoolCheckboxes
        schools={schools}
        selectedSchoolIds={selectedSchoolIds}
        onSelectionChange={setSelectedSchoolIds}
      />
      <FormSubmit disabled={schools.length === 0 || selectedSchoolIds.length === 0}>
        Add Vendor
      </FormSubmit>
    </ReferenceForm>
  );
}

export function EditVendorForm({
  vendor,
  schools
}: {
  vendor: VendorFormValues;
  schools: SchoolOption[];
}) {
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>(vendor.schoolIds);
  const [state, action] = useActionState<VendorActionState, FormData>(
    updateVendorAction.bind(null, vendor.vendorId),
    initialState
  );

  useEffect(() => {
    setSelectedSchoolIds(vendor.schoolIds);
  }, [vendor.schoolIds]);

  return (
    <ReferenceForm action={action} title="Edit Vendor" state={state}>
      <TextField
        name="vendorCode"
        label="Code"
        required
        defaultValue={vendor.vendorCode}
        placeholder="VEN-001"
        helpText="Code is locked after creation."
        readOnly
      />
      <TextField name="vendorName" label="Name" required defaultValue={vendor.vendorName} placeholder="North Booksellers" />
      <TextField name="vendorType" label="Type" defaultValue={vendor.vendorType} placeholder="regional distributor" />
      <TextField name="vendorRating" label="Rating" defaultValue={vendor.vendorRating} placeholder="A" />
      <TextField name="contactPerson" label="Contact" defaultValue={vendor.contactPerson} placeholder="Raghav Mehta" />
      <TextField name="phone" label="Phone" defaultValue={vendor.phone} placeholder="9000011111" />
      <TextField name="email" label="Email" defaultValue={vendor.email} placeholder="ops@vendor.example" />
      <TextField name="address" label="Address" defaultValue={vendor.address} placeholder="Market Road" />
      <SchoolCheckboxes
        schools={schools}
        selectedSchoolIds={selectedSchoolIds}
        onSelectionChange={setSelectedSchoolIds}
      />
      <FormSubmit disabled={schools.length === 0 || selectedSchoolIds.length === 0}>
        Save Vendor
      </FormSubmit>
    </ReferenceForm>
  );
}

export function AddItemForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [state, action] = useActionState<ItemActionState, FormData>(
    createItemAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setResetKey((current) => current + 1);
    }
  }, [state.ok]);

  return (
    <ReferenceForm ref={formRef} action={action} title="Add Item" state={state}>
      <ItemFormFields resetKey={resetKey} />
      <FormSubmit>Add Item</FormSubmit>
    </ReferenceForm>
  );
}

export function EditItemForm({ item }: { item: ItemFormValues }) {
  const [state, action] = useActionState<ItemActionState, FormData>(
    updateItemAction.bind(null, item.itemId),
    initialState
  );

  return (
    <ReferenceForm action={action} title="Edit Item" state={state}>
      <ItemFormFields item={item} />
      <FormSubmit>Save Item</FormSubmit>
    </ReferenceForm>
  );
}

function ItemFormFields({ item, resetKey = 0 }: { item?: ItemFormValues; resetKey?: number }) {
  const emptyCodes = {
    categoryCode: item?.categoryCode ?? "",
    subCategoryCode: item?.subCategoryCode ?? "",
    languageCode: item?.languageCode ?? DEFAULT_LANGUAGE_CODE,
    customisationCode: item?.customisationCode ?? "",
    editionCode: item?.editionCode ?? ""
  };
  const [codes, setCodes] = useState(emptyCodes);

  useEffect(() => {
    setCodes(emptyCodes);
  }, [resetKey, item?.itemId]);

  const generatedCode = useMemo(() => generateItemCode(codes), [codes]);

  function updateCodeField(name: keyof typeof codes, value: string) {
    setCodes((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <input type="hidden" name="itemCode" value={generatedCode} />
      <div className="rounded-md border border-line bg-canvas p-3 md:col-span-2 xl:col-span-3">
        <span className={labelClass}>Generated Code</span>
        <p className="font-semibold text-ink">{generatedCode}</p>
        <p className="mt-1 text-xs text-muted">
          Built from category, sub-category, language, customisation, and edition.
        </p>
      </div>
      <TextField name="itemName" label="Title / Name" required defaultValue={item?.itemName} />
      <TextField
        name="categoryCode"
        label="Category Code"
        required
        defaultValue={item?.categoryCode}
        onChange={(value) => updateCodeField("categoryCode", value)}
      />
      <TextField name="categoryType" label="Category Name / Type" defaultValue={item?.categoryType} />
      <TextField
        name="subCategoryCode"
        label="Sub-category Code"
        required
        defaultValue={item?.subCategoryCode}
        onChange={(value) => updateCodeField("subCategoryCode", value)}
      />
      <TextField
        name="languageCode"
        label="Language Code"
        required
        defaultValue={item?.languageCode ?? DEFAULT_LANGUAGE_CODE}
        onChange={(value) => updateCodeField("languageCode", value)}
      />
      <TextField
        name="customisationCode"
        label="Customisation Code"
        required
        defaultValue={item?.customisationCode}
        onChange={(value) => updateCodeField("customisationCode", value)}
      />
      <TextField name="customisationName" label="Customisation Name" defaultValue={item?.customisationName} />
      <TextField
        name="editionCode"
        label="Edition Code"
        required
        defaultValue={item?.editionCode}
        onChange={(value) => updateCodeField("editionCode", value)}
      />
      <TextField name="mrp" label="MRP" type="number" min="0.01" step="0.01" defaultValue={item?.mrp} />
      <TextField name="isbnNumber" label="ISBN Number" defaultValue={item?.isbnNumber} />
      <label className="mt-6 flex h-10 items-center gap-2 text-sm font-medium text-ink">
        <input name="obsolete" type="checkbox" className="h-4 w-4" defaultChecked={item?.obsolete ?? false} />
        Obsolete
      </label>
      <label className="mt-6 flex h-10 items-center gap-2 text-sm font-medium text-ink">
        <input name="active" type="checkbox" className="h-4 w-4" defaultChecked={item?.active ?? true} />
        Active
      </label>
    </>
  );
}

function ReferenceForm({
  ref,
  action,
  title,
  state,
  children
}: {
  ref?: React.RefObject<HTMLFormElement | null>;
  action: (formData: FormData) => void;
  title: string;
  state: SchoolActionState;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6 p-5">
      <form ref={ref} action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <h2 className="font-semibold text-ink">{title}</h2>
          {state.message ? (
            <p className={`mt-1 text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
        {children}
      </form>
    </Card>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  min,
  step,
  defaultValue,
  placeholder,
  helpText,
  readOnly = false,
  onChange
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  defaultValue?: string | null;
  placeholder?: string;
  helpText?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        step={step}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={inputClass}
      />
      {helpText ? <span className="mt-1 block text-xs text-muted">{helpText}</span> : null}
    </label>
  );
}

function SchoolCheckboxes({
  schools,
  selectedSchoolIds,
  onSelectionChange
}: {
  schools: SchoolOption[];
  selectedSchoolIds: number[];
  onSelectionChange?: (schoolIds: number[]) => void;
}) {
  function toggleSchool(schoolId: number, checked: boolean) {
    if (!onSelectionChange) {
      return;
    }

    onSelectionChange(
      checked
        ? [...selectedSchoolIds, schoolId]
        : selectedSchoolIds.filter((selectedId) => selectedId !== schoolId)
    );
  }

  return (
    <label className="block md:col-span-2 xl:col-span-3">
      <span className={labelClass}>Linked Schools</span>
      <div className="grid gap-2 rounded-md border border-line bg-white p-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
        {schools.map((school) => (
          <label key={school.schoolId} className="flex items-center gap-2 text-ink">
            <input
              name="schoolIds"
              type="checkbox"
              value={school.schoolId}
              className="h-4 w-4"
              checked={selectedSchoolIds.includes(school.schoolId)}
              onChange={(event) => toggleSchool(school.schoolId, event.target.checked)}
            />
            <span>
              {school.schoolCode} - {school.schoolName}
            </span>
          </label>
        ))}
      </div>
      {schools.length === 0 ? (
        <span className="mt-1 block text-xs text-red-700">Add a school before creating vendors.</span>
      ) : selectedSchoolIds.length === 0 ? (
        <span className="mt-1 block text-xs text-red-700">Choose at least one school.</span>
      ) : null}
    </label>
  );
}

function SchoolCodeResult({ state }: { state: SchoolActionState }) {
  if (!state.ok || !state.school) {
    return null;
  }

  return (
    <div className="rounded-md border border-line bg-canvas p-3 md:col-span-2 xl:col-span-3">
      <span className={labelClass}>{state.created ? "Created PT/PR Code" : "Reused PT/PR Code"}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <code className="rounded bg-white px-3 py-2 text-sm font-semibold text-ink">
          {state.school.schoolCode}
        </code>
        <CopyCodeButton code={state.school.schoolCode} />
      </div>
    </div>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <SubmitButton type="button" variant="secondary" onClick={copyCode}>
      {copied ? "Copied" : "Copy Code"}
    </SubmitButton>
  );
}

function FormSubmit({
  children,
  disabled = false
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-end">
      <SubmitButton type="submit" disabled={disabled || pending} className="w-full">
        {pending ? "Saving..." : children}
      </SubmitButton>
    </div>
  );
}
