"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createOrganisationAction,
  updateOrganisationAction,
  type OrganisationActionState
} from "@/app/organisations/actions";
import { Card, SubmitButton } from "@/components/ui";

type OrganisationFormValues = {
  id: string;
  groupCode: string | null;
  prCode: string;
  ptCode: string | null;
  organisationName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  actionStatus: string | null;
  remark: string | null;
  academicYear: string | null;
  strength: number | null;
  boardType: string | null;
  sessionStartFrom: string | null;
  minorityType: string | null;
  saturdayStatus: string | null;
  workingStatus: boolean | null;
};

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const textAreaClass =
  "focus-ring min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";
const initialState = { ok: false } satisfies OrganisationActionState;

export function AddOrganisationForm({ nextCode }: { nextCode: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<OrganisationActionState, FormData>(
    createOrganisationAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <OrganisationForm
      ref={formRef}
      action={action}
      title="Add Organisation"
      description="Assign a PR code on first introduction. PT code is assigned automatically on the first order."
      state={state}
    >
      <TextField
        name="prCode"
        label="PR Code"
        defaultValue={nextCode}
        helpText="Auto-generated from the latest PR code."
        readOnly
      />
      <TextField name="organisationName" label="Organisation Name" required />
      <TextField name="groupCode" label="Group Code" />
      <TextField name="actionStatus" label="Action Status" placeholder="Introduced" />
      <TextField name="address" label="Address" />
      <TextField name="district" label="District" />
      <TextField name="state" label="State" />
      <TextField name="pinCode" label="Pin Code" />
      <TextField name="phone" label="Phone" />
      <TextField name="email" label="Email" />
      <TextField name="website" label="Website" placeholder="school.example" />
      <TextField name="academicYear" label="Academic Year" placeholder="2026-2027" />
      <TextField name="strength" label="Strength" type="number" min="0" />
      <TextField name="boardType" label="Board Type" />
      <TextField name="sessionStartFrom" label="Session Start From" type="date" />
      <TextField name="minorityType" label="Minority Type" />
      <TextField name="saturdayStatus" label="Saturday Status" />
      <SelectField name="workingStatus" label="Working Status" defaultValue="">
        <option value="">Not set</option>
        <option value="true">Working</option>
        <option value="false">Not working</option>
      </SelectField>
      <TextAreaField name="remark" label="Remark" />
      <FormSubmit>Add Organisation</FormSubmit>
    </OrganisationForm>
  );
}

export function EditOrganisationForm({
  organisation
}: {
  organisation: OrganisationFormValues;
}) {
  const [state, action] = useActionState<OrganisationActionState, FormData>(
    updateOrganisationAction.bind(null, organisation.id),
    initialState
  );

  return (
    <OrganisationForm
      action={action}
      title="Edit Organisation"
      description="PR code stays fixed. PT code is assigned only after the first order."
      state={state}
    >
      <TextField name="prCode" label="PR Code" defaultValue={organisation.prCode} readOnly />
      <TextField
        name="ptCode"
        label="PT Code"
        defaultValue={organisation.ptCode}
        helpText="Assigned automatically after the first order."
        readOnly
      />
      <TextField
        name="organisationName"
        label="Organisation Name"
        defaultValue={organisation.organisationName}
        required
      />
      <TextField name="groupCode" label="Group Code" defaultValue={organisation.groupCode} />
      <TextField name="actionStatus" label="Action Status" defaultValue={organisation.actionStatus} />
      <TextField name="address" label="Address" defaultValue={organisation.address} />
      <TextField name="district" label="District" defaultValue={organisation.district} />
      <TextField name="state" label="State" defaultValue={organisation.state} />
      <TextField name="pinCode" label="Pin Code" defaultValue={organisation.pinCode} />
      <TextField name="phone" label="Phone" defaultValue={organisation.phone} />
      <TextField name="email" label="Email" defaultValue={organisation.email} />
      <TextField name="website" label="Website" defaultValue={organisation.website} />
      <TextField name="academicYear" label="Academic Year" defaultValue={organisation.academicYear} />
      <TextField
        name="strength"
        label="Strength"
        type="number"
        min="0"
        defaultValue={organisation.strength === null ? null : String(organisation.strength)}
      />
      <TextField name="boardType" label="Board Type" defaultValue={organisation.boardType} />
      <TextField
        name="sessionStartFrom"
        label="Session Start From"
        type="date"
        defaultValue={organisation.sessionStartFrom}
      />
      <TextField name="minorityType" label="Minority Type" defaultValue={organisation.minorityType} />
      <TextField name="saturdayStatus" label="Saturday Status" defaultValue={organisation.saturdayStatus} />
      <SelectField
        name="workingStatus"
        label="Working Status"
        defaultValue={
          organisation.workingStatus === true
            ? "true"
            : organisation.workingStatus === false
              ? "false"
              : ""
        }
      >
        <option value="">Not set</option>
        <option value="true">Working</option>
        <option value="false">Not working</option>
      </SelectField>
      <TextAreaField name="remark" label="Remark" defaultValue={organisation.remark} />
      <FormSubmit>Save Organisation</FormSubmit>
    </OrganisationForm>
  );
}

function OrganisationForm({
  ref,
  action,
  title,
  description,
  state,
  children
}: {
  ref?: React.RefObject<HTMLFormElement | null>;
  action: (formData: FormData) => void;
  title: string;
  description: string;
  state: OrganisationActionState;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6 p-5">
      <form ref={ref} action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <h2 className="font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
          {state.message ? (
            <p className={`mt-2 text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
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
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        readOnly={readOnly}
        className={inputClass}
      />
      {helpText ? <span className="mt-1 block text-xs text-muted">{helpText}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block md:col-span-2 xl:col-span-3">
      <span className={labelClass}>{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} className={textAreaClass} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

function FormSubmit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-end">
      <SubmitButton type="submit" disabled={pending} className="w-full">
        {pending ? "Saving..." : children}
      </SubmitButton>
    </div>
  );
}
