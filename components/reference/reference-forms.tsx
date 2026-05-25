"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createItemAction, updateItemAction } from "@/app/items/actions";
import type { ReferenceActionState as ItemActionState } from "@/app/items/actions";
import { createSchoolAction, updateSchoolAction } from "@/app/schools/actions";
import type { ReferenceActionState as SchoolActionState } from "@/app/schools/actions";
import { createVendorAction, updateVendorAction } from "@/app/vendors/actions";
import type { ReferenceActionState as VendorActionState } from "@/app/vendors/actions";
import { Card, SubmitButton } from "@/components/ui";

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
  itemType: string | null;
  subject: string | null;
  classLevel: string | null;
  publisher: string | null;
  price: string | null;
  active: boolean;
};

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";
const initialState = { ok: false } satisfies SchoolActionState;

export function AddSchoolForm({ nextCode }: { nextCode: string }) {
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
        required
        defaultValue={nextCode}
        placeholder="SCH-001"
        helpText="Auto-generated from the latest school code."
        readOnly
      />
      <TextField name="schoolName" label="Name" required placeholder="Greenwood Public School" />
      <TextField name="contactPerson" label="Contact" placeholder="Anita Rao" />
      <TextField name="phone" label="Phone" placeholder="9876500011" />
      <TextField name="email" label="Email" placeholder="admin@school.example" />
      <TextField name="address" label="Address" placeholder="Sector 14" />
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
        label="Code"
        required
        defaultValue={school.schoolCode}
        placeholder="SCH-001"
        helpText="Code is locked after creation."
        readOnly
      />
      <TextField name="schoolName" label="Name" required defaultValue={school.schoolName} placeholder="Greenwood Public School" />
      <TextField name="contactPerson" label="Contact" defaultValue={school.contactPerson} placeholder="Anita Rao" />
      <TextField name="phone" label="Phone" defaultValue={school.phone} placeholder="9876500011" />
      <TextField name="email" label="Email" defaultValue={school.email} placeholder="admin@school.example" />
      <TextField name="address" label="Address" defaultValue={school.address} placeholder="Sector 14" />
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
  const [state, action] = useActionState<VendorActionState, FormData>(
    createVendorAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
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
      <SchoolCheckboxes schools={schools} selectedSchoolIds={[]} />
      <FormSubmit disabled={schools.length === 0}>Add Vendor</FormSubmit>
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
  const [state, action] = useActionState<VendorActionState, FormData>(
    updateVendorAction.bind(null, vendor.vendorId),
    initialState
  );

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
      <SchoolCheckboxes schools={schools} selectedSchoolIds={vendor.schoolIds} />
      <FormSubmit disabled={schools.length === 0}>Save Vendor</FormSubmit>
    </ReferenceForm>
  );
}

export function AddItemForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<ItemActionState, FormData>(
    createItemAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <ReferenceForm ref={formRef} action={action} title="Add Item" state={state}>
      <TextField name="itemCode" label="Code" required />
      <TextField name="itemName" label="Name" required />
      <TextField name="itemType" label="Type" />
      <TextField name="subject" label="Subject" />
      <TextField name="classLevel" label="Class" />
      <TextField name="publisher" label="Publisher" />
      <TextField name="price" label="Price" type="number" min="0" step="0.01" />
      <label className="mt-6 flex h-10 items-center gap-2 text-sm font-medium text-ink">
        <input name="active" type="checkbox" className="h-4 w-4" defaultChecked />
        Active
      </label>
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
      <TextField name="itemCode" label="Code" required defaultValue={item.itemCode} />
      <TextField name="itemName" label="Name" required defaultValue={item.itemName} />
      <TextField name="itemType" label="Type" defaultValue={item.itemType} />
      <TextField name="subject" label="Subject" defaultValue={item.subject} />
      <TextField name="classLevel" label="Class" defaultValue={item.classLevel} />
      <TextField name="publisher" label="Publisher" defaultValue={item.publisher} />
      <TextField name="price" label="Price" type="number" min="0" step="0.01" defaultValue={item.price} />
      <label className="mt-6 flex h-10 items-center gap-2 text-sm font-medium text-ink">
        <input name="active" type="checkbox" className="h-4 w-4" defaultChecked={item.active} />
        Active
      </label>
      <FormSubmit>Save Item</FormSubmit>
    </ReferenceForm>
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
  readOnly = false
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
        className={inputClass}
      />
      {helpText ? <span className="mt-1 block text-xs text-muted">{helpText}</span> : null}
    </label>
  );
}

function SchoolCheckboxes({
  schools,
  selectedSchoolIds
}: {
  schools: SchoolOption[];
  selectedSchoolIds: number[];
}) {
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
              defaultChecked={selectedSchoolIds.includes(school.schoolId)}
            />
            <span>
              {school.schoolCode} - {school.schoolName}
            </span>
          </label>
        ))}
      </div>
      {schools.length === 0 ? (
        <span className="mt-1 block text-xs text-red-700">Add a school before creating vendors.</span>
      ) : null}
    </label>
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
