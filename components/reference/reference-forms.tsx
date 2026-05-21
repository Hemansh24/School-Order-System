"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createItemAction } from "@/app/items/actions";
import type { ReferenceActionState as ItemActionState } from "@/app/items/actions";
import { createSchoolAction } from "@/app/schools/actions";
import type { ReferenceActionState as SchoolActionState } from "@/app/schools/actions";
import { createVendorAction } from "@/app/vendors/actions";
import type { ReferenceActionState as VendorActionState } from "@/app/vendors/actions";
import { Card, SubmitButton } from "@/components/ui";

type SchoolOption = {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
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
      <TextField name="schoolCode" label="Code" required />
      <TextField name="schoolName" label="Name" required />
      <TextField name="contactPerson" label="Contact" />
      <TextField name="phone" label="Phone" />
      <TextField name="email" label="Email" />
      <TextField name="address" label="Address" />
      <FormSubmit>Add School</FormSubmit>
    </ReferenceForm>
  );
}

export function AddVendorForm({ schools }: { schools: SchoolOption[] }) {
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
      <TextField name="vendorCode" label="Code" required />
      <TextField name="vendorName" label="Name" required />
      <TextField name="vendorType" label="Type" />
      <TextField name="vendorRating" label="Rating" />
      <TextField name="contactPerson" label="Contact" />
      <TextField name="phone" label="Phone" />
      <TextField name="email" label="Email" />
      <TextField name="address" label="Address" />
      <label className="block md:col-span-2 xl:col-span-3">
        <span className={labelClass}>Linked Schools</span>
        <div className="grid gap-2 rounded-md border border-line bg-white p-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          {schools.map((school) => (
            <label key={school.schoolId} className="flex items-center gap-2 text-ink">
              <input name="schoolIds" type="checkbox" value={school.schoolId} className="h-4 w-4" />
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
      <FormSubmit disabled={schools.length === 0}>Add Vendor</FormSubmit>
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

function ReferenceForm({
  ref,
  action,
  title,
  state,
  children
}: {
  ref: React.RefObject<HTMLFormElement | null>;
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
  step
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
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
        className={inputClass}
      />
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
