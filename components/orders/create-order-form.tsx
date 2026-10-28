"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { convertGsMemberAction, createOrderAction, createReorderAction, updateOrderAction } from "@/app/orders/actions";
import { updateVendorDiscountAction } from "@/app/vendors/actions";
import { Card, SubmitButton } from "@/components/ui";
import { compareEditionCodes, DEFAULT_LANGUAGE_CODE } from "@/lib/item-code";
import { hasLegacySchoolAllocations, isPooledOrder, orderTypeLabel, type DescriptiveMode } from "@/lib/order-model";
import { normalizeOrderEntry } from "@/lib/order-entry";
import { getCurrentSessionYear } from "@/lib/session-year";
import { getOrderEnteredDate } from "@/lib/order-dates";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";
import { distinctEndUsers } from "@/lib/end-user-type";
import { EndUserTypesPreview } from "@/components/orders/end-user-types-preview";
import { ExecutivePicker, type ExecutiveOption } from "@/components/orders/executive-picker";

type SchoolRef = {
  optionKey: string;
  schoolCode: string;
  schoolName: string;
  addressSummary: string;
  contactNumbers?: string[];
  groupType?: "GS" | "Christian";
};
type GroupRef = SchoolRef & { groupType: "GS" | "Christian"; schoolGroupId?: number; locations?: { schoolGroupLocationId: number; subCode: string; addressSummary: string; usable: boolean }[]; members?: { schoolCode: string; schoolName: string; prCode: string; ptCode: string | null }[] };
type VendorRef = {
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  vendorRating: string | null;
  actualDiscount: string | null;
  committedDiscount: string | null;
  contactNumbers?: string[];
  addressSummary: string;
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
  executives?: ExecutiveOption[];
  executiveDefaults?: { schoolCode: string; incumbentCode: string | null; name: string }[];
  schools: SchoolRef[];
  groups: GroupRef[];
  vendors: VendorRef[];
  items: ItemRef[];
  initialValues?: CreateOrderInput;
  reorderSourceId?: number;
  reorderSourceNo?: number;
  reorderSchool?: { schoolCode: string; schoolName: string };
  orderSheet1Id?: number;
  orderCreatedAt?: string;
  submitLabel?: string;
  requiresLegacyConversion?: boolean;
};

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const textAreaClass =
  "focus-ring min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";
const ORDER_DRAFT_STORAGE_KEY = "school-book-order:create-order-draft";

function isSavedOrderDraft(value: unknown): value is CreateOrderInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<CreateOrderInput>;
  return (
    !!draft.sheet1 &&
    typeof draft.sheet1 === "object" &&
    Array.isArray(draft.descriptiveRows) &&
    Array.isArray(draft.ambiguousSchools) &&
    Array.isArray(draft.ambiguousItems) &&
    Array.isArray(draft.combinedSchools) &&
    Array.isArray(draft.combinedItems)
  );
}

function ConcealedDiscount({ vendorCode, discount, onSaved }: { vendorCode: string; discount: string; onSaved: (discount: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [draft, setDraft] = useState(discount);
  const [isSaving, startSaving] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  function saveDiscount() {
    setError(null);
    setMessage(null);
    startSaving(async () => {
      try {
        const result = await updateVendorDiscountAction({ vendorCode, discount: draft });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setDraft(result.discount);
        onSaved(result.discount);
        setMessage("Discount saved for this vendor and future orders.");
      } catch {
        setError("Could not save this discount. Please try again.");
      }
    });
  }

  return (
    <div className="mt-1 text-sm text-muted">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="focus-ring"
          checked={isVisible}
          onChange={event => setIsVisible(event.target.checked)}
        />
        Show discount
      </label>
      {isVisible ? (
        <div className="mt-2 space-y-2">
          <label htmlFor={inputId} className={labelClass}>Discount</label>
          <input
            id={inputId}
            className={inputClass}
            value={draft}
            placeholder="Enter discount"
            maxLength={500}
            disabled={isSaving}
            onChange={event => { setDraft(event.target.value); setMessage(null); setError(null); }}
            onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }}
          />
          <button
            type="button"
            className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-medium disabled:opacity-50"
            disabled={isSaving || !draft.trim() || draft.trim() === discount}
            onClick={saveDiscount}
          >{isSaving ? "Saving discount…" : discount ? "Save discount" : "Add discount"}</button>
          {error ? <p role="alert" className="text-red-700">{error}</p> : null}
          {message ? <p role="status">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function CreateOrderForm({
  schools: sourceSchools,
  groups: sourceGroups,
  vendors,
  items,
  executives = [],
  executiveDefaults = [],
  initialValues,
  reorderSourceId,
  reorderSourceNo,
  reorderSchool,
  orderSheet1Id,
  orderCreatedAt,
  submitLabel = "Create Order",
  requiresLegacyConversion = false
}: Props) {
  const router = useRouter();
  const isReorder = reorderSourceId !== undefined;
  const [step, setStep] = useState(1);
  const [savedDiscounts, setSavedDiscounts] = useState<Record<string, string>>({});
  const [legacySchoolConversion, setLegacySchoolConversion] = useState(requiresLegacyConversion);
  const [serverError, setServerError] = useState<string | null>(null);
  const [convertedCodes, setConvertedCodes] = useState<Record<string, string>>({});
  const [convertingPrCode, setConvertingPrCode] = useState<string | null>(null);
  const conversionInFlight = useRef(false);
  const [conversionError, setConversionError] = useState<{ prCode: string; message: string } | null>(null);
  const ptCodes = useMemo<Record<string, string>>(() => isReorder ? {} : ({
    ...Object.fromEntries(sourceGroups.flatMap(group => (group.members ?? []).flatMap(member => member.ptCode ? [[member.prCode, member.ptCode]] : []))),
    ...convertedCodes
  }), [sourceGroups, convertedCodes, isReorder]);
  const schools = useMemo(() => sourceSchools.map(school => ({ ...school, schoolCode: ptCodes[school.schoolCode] ?? school.schoolCode })), [sourceSchools, ptCodes]);
  const groups = useMemo(() => sourceGroups.map(group => ({ ...group, members: group.members?.map(member => ({ ...member, schoolCode: ptCodes[member.prCode] ?? member.schoolCode, ptCode: ptCodes[member.prCode] ?? member.ptCode })) })), [sourceGroups, ptCodes]);
  const [selectedDescriptiveSchoolKey, setSelectedDescriptiveSchoolKey] = useState(reorderSchool?.schoolCode ?? "");
  const executiveSeenSchools = useRef(new Set([
    ...(initialValues?.descriptiveRows ?? []), ...(initialValues?.combinedSchools ?? [])
  ].map(row => row.schoolCode)));
  const [selectedCategoryCode, setSelectedCategoryCode] = useState(items[0]?.categoryCode ?? "");
  const [selectedCustomisationCode, setSelectedCustomisationCode] = useState(
    items[0]?.customisationCode ?? ""
  );
  const [isBillingDropdownOpen, setIsBillingDropdownOpen] = useState(false);
  const [isShippingDropdownOpen, setIsShippingDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isNewOrder = orderSheet1Id === undefined && initialValues === undefined;
  const [isDraftReady, setIsDraftReady] = useState(!isNewOrder);
  const [currentEntryDate, setCurrentEntryDate] = useState("");
  const orderEnteredDate = orderCreatedAt
    ? getOrderEnteredDate(new Date(orderCreatedAt))
    : currentEntryDate;

  useEffect(() => {
    if (orderCreatedAt) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const now = new Date();
      const day = getOrderEnteredDate(now);
      setCurrentEntryDate(day);
      const nextMidnight = new Date(`${day}T00:00:00+05:30`).getTime() + 86_400_000;
      timer = setTimeout(refresh, nextMidnight - now.getTime() + 50);
    };
    refresh();
    window.addEventListener("focus", refreshOnFocus);
    function refreshOnFocus() {
      clearTimeout(timer);
      refresh();
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [orderCreatedAt]);

  const today = new Date().toISOString().slice(0, 10);
  const newOrderDefaults = useMemo<CreateOrderInput>(
    () => ({
      sheet1: {
        sessionYear: getCurrentSessionYear(),
        orderPlacedDate: today,
        orderReceivedDate: "",
        expectedDeliveryDate: "",
        billingToType: "school",
        billingToCode: "",
        billingToName: "",
        shippingToType: "school",
        shippingToCode: "",
        shippingToName: "",
        shippingToSummary: "",
        orderType: "descriptive",
        descriptiveMode: "individual",
        endUserGroupCode: "",
        booksellerType: "",
        booksellerRating: "",
        pendingPayment: false,
        commissionEnabled: false,
        commissionPartyCode: "",
        contactNumbers: [""],
        notes: ""
      },
      schoolExecutives: [],
      descriptiveRows: [],
      ambiguousSchools: [],
      ambiguousItems: [],
      combinedSchools: [],
      combinedItems: []
    }),
    [today]
  );

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
    defaultValues: normalizeOrderEntry(initialValues ?? newOrderDefaults)
  });

  useEffect(() => {
    if (!isReorder || !currentEntryDate) return;
    form.setValue("sheet1.orderPlacedDate", currentEntryDate);
    form.setValue("sheet1.orderReceivedDate", currentEntryDate);
    form.setValue("sheet1.sessionYear", getCurrentSessionYear(new Date(`${currentEntryDate}T12:00:00+05:30`)));
  }, [form, isReorder, currentEntryDate]);

  const orderType = form.watch("sheet1.orderType");
  const commissionEnabled = form.watch("sheet1.commissionEnabled") ?? false;
  const commissionPartyCode = form.watch("sheet1.commissionPartyCode") ?? "";
  const commissionPartyType = form.watch("sheet1.commissionPartyType");
  const commissionPercentage = form.watch("sheet1.commissionPercentage");
  const [isCommissionDropdownOpen, setIsCommissionDropdownOpen] = useState(false);
  const commissionOptions = useMemo(() => [...new Map([
    ...schools.map(school => ({ type: "school" as const, code: school.schoolCode, name: school.schoolName })),
    ...vendors.map(vendor => ({ type: "vendor" as const, code: vendor.vendorCode, name: vendor.vendorName })),
    ...groups.map(group => ({ type: "group" as const, code: group.schoolCode, name: group.schoolName }))
  ].map(option => [`${option.type}:${option.code}`, option])).values()], [schools, vendors, groups]);
  const selectedCommissionOption = commissionOptions.find(option => option.type === commissionPartyType && option.code === commissionPartyCode);
  const filteredCommissionOptions = commissionOptions.filter(option => {
    const query = commissionPartyCode.trim().toLowerCase();
    return !query || option.code.toLowerCase().includes(query) || option.name.toLowerCase().includes(query);
  }).slice(0, 50);
  const billingToType = form.watch("sheet1.billingToType");
  const billingToCode = form.watch("sheet1.billingToCode");
  const shippingToType = form.watch("sheet1.shippingToType");
  const shippingToCode = form.watch("sheet1.shippingToCode");
  const billingPartyType = billingToType;
  const shippingPartyType = shippingToType;
  const descriptiveMode = form.watch("sheet1.descriptiveMode") ?? "individual";
  const endUserGroupCode = form.watch("sheet1.endUserGroupCode") ?? "";
  const isGroup = orderType === "descriptive" && descriptiveMode === "multiple_group";
  const isMultiple = orderType === "descriptive" && descriptiveMode !== "individual";
  const watchedDescriptiveRows = form.watch("descriptiveRows");
  const watchedAmbiguousItems = form.watch("ambiguousItems");
  const watchedCombinedItems = form.watch("combinedItems");
  const watchedCombinedSchools = form.watch("combinedSchools");

  const descriptiveRows = useFieldArray({ control: form.control, name: "descriptiveRows" });
  const ambiguousItems = useFieldArray({ control: form.control, name: "ambiguousItems" });
  const combinedSchools = useFieldArray({ control: form.control, name: "combinedSchools" });
  const combinedItems = useFieldArray({ control: form.control, name: "combinedItems" });

  useEffect(() => {
    if (!isDraftReady) return;
    for (const name of ["combinedSchools", "descriptiveRows", "ambiguousSchools"] as const) {
      const rows = form.getValues(name);
      if (rows.some(row => ptCodes[row.schoolCode] && ptCodes[row.schoolCode] !== row.schoolCode)) {
        form.setValue(name, rows.map(row => ({ ...row, schoolCode: ptCodes[row.schoolCode] ?? row.schoolCode })), { shouldDirty: true, shouldValidate: true });
      }
    }
    for (const party of ["billing", "shipping"] as const) {
      const code = form.getValues(`sheet1.${party}ToCode`);
      if (form.getValues(`sheet1.${party}ToType`) === "school" && ptCodes[code] && ptCodes[code] !== code) {
        form.setValue(`sheet1.${party}ToCode`, ptCodes[code], { shouldDirty: true, shouldValidate: true });
      }
    }
    const commissionCode = form.getValues("sheet1.commissionPartyCode");
    if (form.getValues("sheet1.commissionPartyType") === "school" && commissionCode && ptCodes[commissionCode] && ptCodes[commissionCode] !== commissionCode) {
      form.setValue("sheet1.commissionPartyCode", ptCodes[commissionCode], { shouldDirty: true, shouldValidate: true });
    }
  }, [ptCodes, isDraftReady, form]);

  async function convertSchool(prCode: string) {
    if (conversionInFlight.current) return;
    conversionInFlight.current = true;
    setConvertingPrCode(prCode);
    setConversionError(null);
    try {
      const result = await convertGsMemberAction({ groupCode: form.getValues("sheet1.endUserGroupCode") ?? "", prCode });
      if (!result.ok) {
        setConversionError({ prCode, message: result.message });
        return;
      }
      setConvertedCodes(previous => ({ ...previous, [result.prCode]: result.ptCode }));
    } catch {
      setConversionError({ prCode, message: "Could not convert this school. Please try again." });
    } finally {
      conversionInFlight.current = false;
      setConvertingPrCode(null);
    }
  }

  useEffect(() => {
    if (!isNewOrder) {
      return;
    }

    try {
      const savedDraft = window.sessionStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft: unknown = JSON.parse(savedDraft);
        if (isSavedOrderDraft(parsedDraft)) {
          setLegacySchoolConversion(hasLegacySchoolAllocations({ ...parsedDraft.sheet1, descriptiveRows: parsedDraft.descriptiveRows }) || !!(parsedDraft as CreateOrderInput & { legacySchoolConversion?: boolean }).legacySchoolConversion);
          executiveSeenSchools.current = new Set([...parsedDraft.descriptiveRows, ...parsedDraft.combinedSchools].map(row => row.schoolCode));
          const savedSchoolKey = (parsedDraft as CreateOrderInput & { selectedDescriptiveSchoolKey?: unknown }).selectedDescriptiveSchoolKey;
          if (typeof savedSchoolKey === "string") setSelectedDescriptiveSchoolKey(savedSchoolKey);
          form.reset(normalizeOrderEntry({
            ...parsedDraft,
            sheet1: { ...parsedDraft.sheet1, sessionYear: getCurrentSessionYear(), orderPlacedDate: parsedDraft.sheet1.orderPlacedDate || parsedDraft.sheet1.orderReceivedDate }
          }));
        }
      }
    } catch {
      window.sessionStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
    } finally {
      setIsDraftReady(true);
    }
  }, [form, isNewOrder]);

  useEffect(() => {
    if (!isNewOrder || !isDraftReady) {
      return;
    }

    const subscription = form.watch((values) => {
      window.sessionStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify({ ...values, legacySchoolConversion, selectedDescriptiveSchoolKey }));
    });

    return () => subscription.unsubscribe();
  }, [form, isDraftReady, isNewOrder, legacySchoolConversion, selectedDescriptiveSchoolKey]);

  const billingOptions = useMemo(
    () =>
      (billingToType === "school" || billingToType === "group")
        ? [...schools, ...groups].map((school) => ({
          value: school.optionKey,
          code: school.schoolCode,
          name: school.schoolName,
          type: "",
          rating: "",
          discount: null,
          addressSummary: school.addressSummary,
          contactNumbers: school.contactNumbers ?? [],
          isGroup: groups.some((group) => group.optionKey === school.optionKey),
          groupType: groups.find((group) => group.optionKey === school.optionKey)?.groupType
          }))
        : vendors.map((vendor) => ({
            value: vendor.vendorCode,
            code: vendor.vendorCode,
            name: vendor.vendorName,
            type: vendor.vendorType ?? "",
          rating: vendor.vendorRating ?? "",
          discount: savedDiscounts[vendor.vendorCode] ?? (vendor.actualDiscount?.trim() || vendor.committedDiscount?.trim() || null),
          addressSummary: vendor.addressSummary,
          contactNumbers: vendor.contactNumbers ?? [],
          isGroup: false,
          groupType: undefined
          })),
    [billingToType, schools, groups, vendors, savedDiscounts]
  );
  const selectedBillingOption = useMemo(
    () =>
      billingOptions.find(
        (option) => option.code.toLowerCase() === billingToCode.trim().toLowerCase()
      ),
    [billingOptions, billingToCode]
  );
  const selectedGs = groups.find(group => group.groupType === "GS" && group.schoolCode.toLowerCase() === endUserGroupCode.toLowerCase() && group.schoolGroupId);
  const contactNumbers = form.watch("sheet1.contactNumbers") ?? [""];
  const appliedContactCode = useRef<string | null>(null);
  useEffect(() => {
    if (!isDraftReady) return;
    if (billingToType === "school" && ptCodes[billingToCode] && ptCodes[billingToCode] !== billingToCode) {
      // A code assignment keeps the same payer and its manually entered numbers.
      appliedContactCode.current = `school:${ptCodes[billingToCode].trim().toLowerCase()}`;
      return;
    }
    const key = `${billingToType}:${billingToCode.trim().toLowerCase()}`;
    if (appliedContactCode.current === key) return;
    const firstSelection = appliedContactCode.current === null;
    appliedContactCode.current = key;
    // Keep saved order/draft numbers, including manual edits, on initial load.
    if (firstSelection && form.getValues("sheet1.contactNumbers") !== undefined) return;
    const numbers = selectedBillingOption?.contactNumbers ?? [];
    form.setValue("sheet1.contactNumbers", numbers.length ? [...numbers] : [""], { shouldValidate: true });
  }, [billingToType, billingToCode, selectedBillingOption, isDraftReady, form, ptCodes]);
  const hasGsParticipants = isGroup && (!!selectedGs || (!!initialValues && /^GS\d/i.test(endUserGroupCode) && endUserGroupCode === initialValues.sheet1.endUserGroupCode));
  const gsSchoolOptions = [...new Map([
    ...(selectedGs?.members ?? []).map(member => ({ schoolCode: member.schoolCode, schoolName: member.schoolName, notes: "" })),
    ...(hasGsParticipants && endUserGroupCode === initialValues?.sheet1.endUserGroupCode ? initialValues.combinedSchools : []),
    ...(hasGsParticipants ? watchedCombinedSchools : [])
  ].map(school => {
    const schoolCode = ptCodes[school.schoolCode] ?? school.schoolCode;
    return [schoolCode, { ...school, schoolCode }] as const;
  })).values()];
  const appliedGs = useRef<string | null>(null);
  useEffect(() => {
    if (!isDraftReady || isReorder) return;
    const key = isGroup ? endUserGroupCode : "";
    if (key === appliedGs.current) return;
    const initial = appliedGs.current === null;
    appliedGs.current = key;
    const preserve = initial && form.getValues("combinedSchools").length > 0;
    if (!preserve) form.setValue("sheet1.schoolGroupId", selectedGs?.schoolGroupId);
    if (selectedGs && !preserve) {
      form.setValue("combinedSchools", (selectedGs.members ?? []).map(member => ({ schoolCode: member.schoolCode, schoolName: member.schoolName, notes: "" })));
    }
  }, [endUserGroupCode, selectedGs, isGroup, isDraftReady, isReorder, form]);

  const filteredBillingOptions = useMemo(() => {
    const query = billingToCode.trim().toLowerCase();

    return billingOptions
      .filter((option) => billingPartyType === "individual" ? false : billingPartyType === "vendor" || option.isGroup === (billingPartyType === "group"))
      .filter(
        (option) =>
          !query ||
          option.code.toLowerCase().includes(query) ||
          option.name.toLowerCase().includes(query)
      )
      .slice(0, 50);
  }, [billingOptions, billingToCode, billingPartyType]);

  const shippingOptions = useMemo(
    () =>
      (shippingToType === "school" || shippingToType === "group")
        ? [...schools, ...groups].map((school) => ({
            value: school.optionKey,
            code: school.schoolCode,
            name: school.schoolName,
            isGroup: groups.some((group) => group.optionKey === school.optionKey),
            addressSummary: school.addressSummary
          }))
        : vendors.map((vendor) => ({
            value: vendor.vendorCode,
            code: vendor.vendorCode,
            name: vendor.vendorName,
            isGroup: false,
            addressSummary: vendor.addressSummary
          })),
    [shippingToType, schools, groups, vendors]
  );
  const filteredShippingOptions = useMemo(() => {
    const query = shippingToCode.trim().toLowerCase();

    return shippingOptions
      .filter((option) => shippingPartyType === "individual" ? false : shippingPartyType === "vendor" || option.isGroup === (shippingPartyType === "group"))
      .filter(
        (option) =>
          !query ||
          option.code.toLowerCase().includes(query) ||
          option.name.toLowerCase().includes(query)
      )
      .slice(0, 50);
  }, [shippingOptions, shippingToCode, shippingPartyType]);

  const activeDescriptiveSchoolKey = selectedDescriptiveSchoolKey || findSchoolOptionByStoredValue(schools, watchedDescriptiveRows[0]?.schoolCode, watchedDescriptiveRows[0]?.schoolName)?.optionKey || "";
  const activeDescriptiveSchool = isReorder ? reorderSchool : schools.find(school => school.optionKey === activeDescriptiveSchoolKey);
  const executiveSchools = orderType === "descriptive"
    ? distinctEndUsers(isMultiple ? watchedCombinedSchools : activeDescriptiveSchool ? [activeDescriptiveSchool] : watchedDescriptiveRows)
    : [];
  const executiveSchoolKey = JSON.stringify(executiveSchools.map(row => row.schoolCode));
  const watchedExecutives = form.watch("schoolExecutives") ?? [];
  useEffect(() => {
    if (!isDraftReady || isReorder) return;
    const codes: string[] = JSON.parse(executiveSchoolKey);
    const retained = new Set(codes);
    const previous = form.getValues("schoolExecutives") ?? [];
    const next = previous.map(row => ({ ...row, schoolCode: ptCodes[row.schoolCode] ?? row.schoolCode })).filter(row => retained.has(row.schoolCode));
    const seen = new Set([...executiveSeenSchools.current].map(code => ptCodes[code] ?? code));
    for (const schoolCode of codes) {
      if (next.some(row => row.schoolCode === schoolCode)) continue;
      const saved = !seen.has(schoolCode) ? executiveDefaults.find(row => (ptCodes[row.schoolCode] ?? row.schoolCode) === schoolCode) : undefined;
      next.push({ schoolCode, incumbentCode: saved?.incumbentCode ?? null, name: saved?.name ?? "", updateDefault: false });
    }
    executiveSeenSchools.current = retained;
    if (JSON.stringify(previous) !== JSON.stringify(next)) form.setValue("schoolExecutives", next, { shouldValidate: true });
  }, [executiveSchoolKey, executiveDefaults, ptCodes, isDraftReady, isReorder, form]);

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
    const selected = billingOptions.find(option => option.value === value);
    form.setValue("sheet1.billingToCode", selected?.code ?? "");
    form.setValue("sheet1.billingToName", selected?.name ?? "");
    form.setValue("sheet1.booksellerType", selected?.type ?? "");
    form.setValue("sheet1.booksellerRating", selected?.rating ?? "");
    setIsBillingDropdownOpen(false);
  }
  function setBillingCode(rawCode: string) {
    form.setValue("sheet1.billingToCode", rawCode);
    form.setValue("sheet1.billingToName", "");
    setIsBillingDropdownOpen(true);
    const selected = billingOptions.find(option => option.code.toLowerCase() === rawCode.trim().toLowerCase());
    if (selected) setBilling(selected.value);
  }
  function setShipping(value: string) {
    const selected = shippingOptions.find(option => option.value === value);
    form.setValue("sheet1.shippingToCode", selected?.code ?? "");
    form.setValue("sheet1.shippingToName", selected?.name ?? "");
    form.setValue("sheet1.shippingToSummary", selected?.addressSummary ?? "");
    setIsShippingDropdownOpen(false);
  }
  function setShippingCode(rawCode: string) {
    form.setValue("sheet1.shippingToCode", rawCode);
    form.setValue("sheet1.shippingToName", "");
    form.setValue("sheet1.shippingToSummary", "");
    setIsShippingDropdownOpen(true);
    const selected = shippingOptions.find(option => option.code.toLowerCase() === rawCode.trim().toLowerCase());
    if (selected) setShipping(selected.value);
  }

  function setCombinedSchool(index: number, optionKey: string) {
    const selected = schools.find((school) => school.optionKey === optionKey);
    form.setValue(`combinedSchools.${index}.schoolCode`, selected?.schoolCode ?? "");
    form.setValue(`combinedSchools.${index}.schoolName`, selected?.schoolName ?? "");
  }

  function appendCombinedSchool() {
    const selectedCodes = new Set(form.getValues("combinedSchools").map((school) => school.schoolCode));
    const firstSchool = schools.find((school) => !selectedCodes.has(school.schoolCode));
    if (!firstSchool) {
      return;
    }
    combinedSchools.append({ schoolCode: firstSchool.schoolCode, schoolName: firstSchool.schoolName, notes: "" });
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

  function setCombinedItemQuantity(item: ItemRef, rawQuantity: string) {
    const rows = form.getValues("combinedItems");
    const rowIndex = rows.findIndex((row) => row.itemCode === item.itemCode);
    const pooledQuantity = Number(rawQuantity);

    if (!rawQuantity || Number.isNaN(pooledQuantity) || pooledQuantity <= 0) {
      if (rowIndex >= 0) {
        combinedItems.remove(rowIndex);
      }
      return;
    }

    const nextRow = { itemCode: item.itemCode, itemName: item.itemName, pooledQuantity, notes: "" };
    if (rowIndex >= 0) {
      form.setValue(`combinedItems.${rowIndex}`, nextRow);
    } else {
      combinedItems.append(nextRow);
    }
  }

  function changeEntry(type: "descriptive" | "ambiguous", mode: DescriptiveMode = descriptiveMode) {
    if (type === orderType && mode === descriptiveMode) return;
    const hasRows = ["descriptiveRows", "ambiguousSchools", "ambiguousItems", "combinedSchools", "combinedItems"].some(key => (form.getValues(key as "descriptiveRows") ?? []).length);
    if (hasRows && !window.confirm("Changing the order entry will discard the current schools and item quantities. Continue?")) return;
    setLegacySchoolConversion(false);
    setSelectedDescriptiveSchoolKey("");
    form.setValue("sheet1.orderType", type);
    form.setValue("sheet1.descriptiveMode", mode);
    form.setValue("sheet1.endUserGroupCode", "");
    form.setValue("sheet1.schoolGroupId", undefined);
    form.setValue("sheet1.schoolGroupLocationId", undefined);
    form.setValue("descriptiveRows", []);
    form.setValue("ambiguousSchools", []);
    form.setValue("ambiguousItems", []);
    form.setValue("combinedSchools", []);
    form.setValue("combinedItems", []);
    form.setValue("schoolExecutives", []);
    executiveSeenSchools.current.clear();
  }

  async function submit(values: CreateOrderInput) {
    if (conversionInFlight.current) return;
    if (legacySchoolConversion && !window.confirm("This older order stores per-school quantities. Saving will replace those allocations with shared item totals. Continue?")) return;
    setServerError(null);
    startTransition(async () => {
      const result =
        reorderSourceId !== undefined
          ? await createReorderAction(reorderSourceId, {
              shipping: { shippingToType: values.sheet1.shippingToType, shippingToCode: values.sheet1.shippingToCode, shippingToName: values.sheet1.shippingToName, shippingToSummary: values.sheet1.shippingToSummary, expectedDeliveryDate: values.sheet1.expectedDeliveryDate },
              descriptiveItems: values.descriptiveRows.map(({ itemCode, itemName, quantity, notes }) => ({ itemCode, itemName, quantity, notes })),
              ambiguousItems: values.ambiguousItems, combinedItems: values.combinedItems
            })
          : orderSheet1Id === undefined
          ? await createOrderAction(values)
          : await updateOrderAction(orderSheet1Id, values);
      if (!result.ok) {
        setServerError(result.message ?? "Could not create order.");
        return;
      }
      if (isNewOrder) {
        window.sessionStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
      }
      router.push(`/orders/${result.orderSheet1Id}`);
      router.refresh();
    });
  }

  async function goNext() {
    if (step === 1 && !(await form.trigger("sheet1"))) return;
    if (step === 3) {
      const isValid = await form.trigger();
      if (!isValid) {
        return;
      }
    }

    setStep((current) => Math.min(4, current + 1));
  }

  function clearOrder() {
    form.reset(newOrderDefaults);
    setLegacySchoolConversion(false);
    setStep(1);
    setServerError(null);
    setSelectedDescriptiveSchoolKey("");
    setSelectedCategoryCode(items[0]?.categoryCode ?? "");
    setSelectedCustomisationCode(items[0]?.customisationCode ?? "");
    setIsBillingDropdownOpen(false);
    setIsShippingDropdownOpen(false);
    setIsCommissionDropdownOpen(false);
    window.sessionStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
  }

  const errors = form.formState.errors;
  const canSubmit = step === 4 && form.formState.isValid && !isPending && !convertingPrCode;

  function renderExecutivePicker(schoolCode?: string) {
    if (isReorder) {
      const saved = watchedExecutives.find(row => row.schoolCode === schoolCode);
      return <p className="text-sm text-muted">Executive: {saved?.name || "Not assigned"}{saved?.incumbentCode ? ` — ${saved.incumbentCode}` : ""}</p>;
    }
    return <div className="min-w-0">
      {schoolCode ? <ExecutivePicker options={executives}
        value={watchedExecutives.find(row => row.schoolCode === schoolCode) ?? { name: "" }}
        onChange={value => {
          const rows = form.getValues("schoolExecutives") ?? [];
          form.setValue("schoolExecutives", [...rows.filter(row => row.schoolCode !== schoolCode), { ...value, schoolCode, updateDefault: true }], { shouldDirty: true, shouldValidate: true });
        }} /> : <Field label="Executive"><input disabled className={`${inputClass} bg-slate-50`} placeholder="Choose a school first" /></Field>}
      <p className="mt-1 text-xs text-muted">Optional. Saved changes become this school's default.</p>
    </div>;
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      {isReorder ? <p className="rounded-md border border-line bg-canvas p-3 text-sm">Reorder of Order {reorderSourceNo}. Billing, end users, and other saved details are fixed. Choose new items and quantities; shipping and expected delivery can change. Placed and received dates are set to today when saved.</p> : null}
      <div className="grid gap-3 sm:grid-cols-4">
        {["Order Sheet 1", orderType === "ambiguous" ? "Order Sheet 2B2 - Item quantities" : isMultiple ? "Order Sheet 2C1 + 2C2" : "Order Sheet 2A", "Review", "Lock/Finalize"].map(
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

      {legacySchoolConversion ? <p className="rounded-md border border-line bg-canvas p-3 text-sm text-ink">
        This older order has quantities per school. Its item quantities are shown as shared totals here; saving will convert it to Multiple Schools.
      </p> : null}

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
              <input readOnly={isNewOrder || isReorder} className={inputClass} {...form.register("sheet1.sessionYear")} />
              {isNewOrder ? <p className="mt-1 text-xs text-muted">Set automatically for use in the next academic year.</p> : null}
            </Field>
            <Field label="Order Placed Date" error={errors.sheet1?.orderPlacedDate?.message}>
              <input type="date" readOnly={isReorder} className={inputClass} {...form.register("sheet1.orderPlacedDate")} />
              <p className="mt-1 text-xs text-muted">{isReorder ? "Set to today in India when the reorder is saved." : "When the other party gave the order to us."}</p>
            </Field>
            <Field label="Order Received Date" error={errors.sheet1?.orderReceivedDate?.message}>
              <input
                type="date"
                className={inputClass}
                {...form.register("sheet1.orderReceivedDate")}
                readOnly={isReorder}
              />
              <p className="mt-1 text-xs text-muted">{isReorder ? "Set to today in India when the reorder is saved." : "When the order was introduced to us."}</p>
            </Field>
            <Field label="Order Expected Date" error={errors.sheet1?.expectedDeliveryDate?.message}>
              <input type="date" className={inputClass} {...form.register("sheet1.expectedDeliveryDate")} />
              <p className="mt-1 text-xs text-muted">When the other party expects delivery.</p>
            </Field>
            <Field label="Order Entered Date">
              <input type="date" readOnly className={inputClass} value={orderEnteredDate} />
              <p className="mt-1 text-xs text-muted">{orderCreatedAt ? "Recorded automatically when this order was first saved (India time)." : "Set automatically when the order is first saved (India time)."}</p>
            </Field>
            <Field label="Billing To Type">
              <select disabled={isReorder} className={inputClass} value={billingPartyType} onChange={event => {
                form.setValue("sheet1.billingToType", event.target.value as "school" | "vendor" | "group" | "individual");
                form.setValue("sheet1.billingToCode", "");
                form.setValue("sheet1.billingToName", "");
                form.setValue("sheet1.booksellerType", "");
                form.setValue("sheet1.booksellerRating", "");
              }}>
                <option value="school">School</option>
                <option value="vendor">Vendor / Bookseller</option>
                <option value="group">Group</option>
                <option value="individual">Individual / manual entry</option>
              </select>
            </Field>
            <Field label="Billing To Code/Name" error={errors.sheet1?.billingToName?.message ?? errors.sheet1?.billingToCode?.message}>
              <div className="relative">
                <input
                  className={inputClass}
                  readOnly={isReorder}
                  value={billingToType === "individual" ? form.watch("sheet1.billingToName") : form.watch("sheet1.billingToCode")}
                  onChange={event => billingToType === "individual" ? form.setValue("sheet1.billingToName", event.target.value) : setBillingCode(event.target.value)}
                  onFocus={() => { if (!isReorder) setIsBillingDropdownOpen(true); }}
                  onBlur={() => {
                    window.setTimeout(() => setIsBillingDropdownOpen(false), 150);
                  }}
                  placeholder="Select a reference or choose manual entry"
                />
                {billingToType !== "individual" && form.watch("sheet1.billingToName") ? <p className="mt-1 text-sm text-muted">{form.watch("sheet1.billingToName")}</p> : null}
                {!isReorder && billingToType === "vendor" && selectedBillingOption ? (
                  <ConcealedDiscount
                    key={selectedBillingOption.code}
                    vendorCode={selectedBillingOption.code}
                    discount={selectedBillingOption.discount ?? ""}
                    onSaved={discount => setSavedDiscounts(current => ({ ...current, [selectedBillingOption.code]: discount }))}
                  />
                ) : null}
                {isBillingDropdownOpen && billingToType !== "individual" ? (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-white shadow-lg">
                    {filteredBillingOptions.length > 0 ? (
                      filteredBillingOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-canvas ${
                            selectedBillingOption?.value === option.value ? "bg-canvas" : ""
                          }`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setBilling(option.value);
                          }}
                        >
                          <span className="font-medium text-ink">{option.code}</span>
                          <span className="ml-2 text-muted">{option.name}</span>
                          {option.groupType ? <span className="ml-2 text-xs text-muted">{option.groupType}</span> : null}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted">No billing matches found.</div>
                    )}
                  </div>
                ) : null}
              </div>
            </Field>
            <Field label="Shipping To Type">
              <select className={inputClass} value={shippingPartyType} onChange={event => {
                form.setValue("sheet1.shippingToType", event.target.value as "school" | "vendor" | "group" | "individual");
                form.setValue("sheet1.shippingToCode", "");
                form.setValue("sheet1.shippingToName", "");
                form.setValue("sheet1.shippingToSummary", "");
              }}>
                <option value="school">School</option>
                <option value="vendor">Vendor / Bookseller</option>
                <option value="group">Group</option>
                <option value="individual">Individual / manual entry</option>
              </select>
            </Field>
            <Field label="Shipping To Code/Name" error={errors.sheet1?.shippingToName?.message ?? errors.sheet1?.shippingToCode?.message}>
              <div className="relative">
                <input
                  className={inputClass}
                  value={shippingToType === "individual" ? form.watch("sheet1.shippingToName") : form.watch("sheet1.shippingToCode")}
                  onChange={event => shippingToType === "individual" ? form.setValue("sheet1.shippingToName", event.target.value) : setShippingCode(event.target.value)}
                  onFocus={() => setIsShippingDropdownOpen(true)}

                  onBlur={() => {
                    window.setTimeout(() => setIsShippingDropdownOpen(false), 150);
                  }}
                  placeholder="Select a reference or choose manual entry"
                />
                {shippingToType !== "individual" && form.watch("sheet1.shippingToName") ? <p className="mt-1 text-sm text-muted">{form.watch("sheet1.shippingToName")}</p> : null}
                {isShippingDropdownOpen && shippingToType !== "individual" ? (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-white shadow-lg">
                    {filteredShippingOptions.length > 0 ? (
                      filteredShippingOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-canvas"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setShipping(option.value);
                          }}
                        >
                          <span className="font-medium text-ink">{option.code}</span>
                          <span className="ml-2 text-muted">{option.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted">No shipping matches found.</div>
                    )}
                  </div>
                ) : null}
              </div>
            </Field>
            <Field label="Order Type" error={errors.sheet1?.orderType?.message}>
              <select
                className={inputClass}
                value={orderType}
                disabled={isReorder}
                onChange={event => changeEntry(event.target.value as "descriptive" | "ambiguous")}
              >
                <option value="descriptive">Descriptive</option>
                <option value="ambiguous">Ambiguous</option>
              </select>
              <p className="mt-1 text-xs text-muted">Descriptive: end schools are known. Ambiguous: end schools are not yet known.</p>
            </Field>
            <fieldset disabled={isReorder} className="md:col-span-3">
              <legend className={labelClass}>Contact numbers</legend>
              <p className="mb-2 text-xs text-muted">{isReorder ? "Copied from the original order." : "Autofilled from the Billing To code. You can edit the numbers or add more."}</p>
              <div className="space-y-2">
                {(contactNumbers.length ? contactNumbers : [""]).map((number, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-full max-w-sm">
                      <input
                        type="tel"
                        className={inputClass}
                        aria-label={`Contact number ${index + 1}`}
                        placeholder="Enter a contact number"
                        value={number}
                        onChange={event => {
                          const next = [...(contactNumbers.length ? contactNumbers : [""])];
                          next[index] = event.target.value;
                          form.setValue("sheet1.contactNumbers", next, { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      {errors.sheet1?.contactNumbers?.[index]?.message ? <p className="mt-1 text-xs text-red-700">{errors.sheet1.contactNumbers[index]?.message}</p> : null}
                    </div>
                    {contactNumbers.length > 1 ? <button type="button" className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line text-red-700" aria-label={`Remove contact number ${index + 1}`} onClick={() => form.setValue("sheet1.contactNumbers", contactNumbers.filter((_, position) => position !== index), { shouldDirty: true, shouldValidate: true })}><Trash2 className="h-4 w-4" /></button> : null}
                  </div>
                ))}
              </div>
              <button type="button" className="focus-ring mt-2 flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-brand-dark" onClick={() => form.setValue("sheet1.contactNumbers", [...(contactNumbers.length ? contactNumbers : [""]), ""], { shouldDirty: true })}><Plus className="h-4 w-4" />Add contact number</button>
            </fieldset>
            <Field label="Bookseller Type">
              <input readOnly={isReorder} className={inputClass} {...form.register("sheet1.booksellerType")} />
            </Field>
            <Field label="Bookseller Rating">
              <input readOnly={isReorder} className={inputClass} {...form.register("sheet1.booksellerRating")} />
            </Field>
            <div className="mt-6 flex h-10 items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input disabled={isReorder} type="checkbox" className="h-4 w-4" {...form.register("sheet1.pendingPayment")} />
                Pending payment
              </label>
              {isNewOrder ? (
                <SubmitButton type="button" variant="secondary" onClick={clearOrder}>
                  Clear order
                </SubmitButton>
              ) : null}
            </div>
          </div>
          <fieldset disabled={isReorder} className="mt-4 space-y-3 rounded-md border border-line p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" className="focus-ring h-4 w-4" checked={commissionEnabled} onChange={event => {
                form.setValue("sheet1.commissionEnabled", event.target.checked, { shouldDirty: true });
                if (!event.target.checked) {
                  form.setValue("sheet1.commissionPartyType", undefined);
                  form.setValue("sheet1.commissionPartyCode", "");
                  form.setValue("sheet1.commissionPercentage", undefined);
                  form.clearErrors(["sheet1.commissionPartyCode", "sheet1.commissionPartyType", "sheet1.commissionPercentage"]);
                  setIsCommissionDropdownOpen(false);
                }
                void form.trigger("sheet1");
              }} />
              Add commission
            </label>
            {commissionEnabled ? <div className="grid gap-4 md:grid-cols-2">
              <Field label="Commission" error={errors.sheet1?.commissionPartyCode?.message ?? errors.sheet1?.commissionPartyType?.message}>
                <div className="relative">
                  <input className={inputClass} value={commissionPartyCode} placeholder="Enter a name or code, or search existing parties"
                    onFocus={() => setIsCommissionDropdownOpen(true)}
                    onBlur={() => window.setTimeout(() => setIsCommissionDropdownOpen(false), 150)}
                    onChange={event => {
                      form.setValue("sheet1.commissionPartyType", "individual", { shouldDirty: true });
                      form.setValue("sheet1.commissionPartyCode", event.target.value, { shouldDirty: true, shouldValidate: true });
                      setIsCommissionDropdownOpen(true);
                    }} />
                  {selectedCommissionOption ? <p className="mt-1 text-sm text-muted">{selectedCommissionOption.name}</p> : null}
                  <p className="mt-1 text-xs text-muted">Select an existing party or enter any other commissioned party’s name or code.</p>
                  {isCommissionDropdownOpen ? <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-white shadow-lg">
                    {filteredCommissionOptions.length ? filteredCommissionOptions.map(option => <button
                      key={`${option.type}:${option.code}`} type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-canvas focus:bg-canvas"
                      onClick={() => {
                        form.setValue("sheet1.commissionPartyType", option.type, { shouldDirty: true });
                        form.setValue("sheet1.commissionPartyCode", option.code, { shouldDirty: true, shouldValidate: true });
                        setIsCommissionDropdownOpen(false);
                      }}>
                      <span className="font-semibold">{option.code}</span> <span className="text-muted">{option.name} ({option.type === "vendor" ? "Bookseller" : option.type})</span>
                    </button>) : <p className="px-3 py-2 text-sm text-muted">No matching parties. You can save the text entered above.</p>}
                  </div> : null}
                </div>
              </Field>
              <Field label="Percentage" error={errors.sheet1?.commissionPercentage?.message}>
                <input type="number" min="0" max="100" step="any" className={inputClass} placeholder="e.g. 7.5"
                  value={commissionPercentage ?? ""}
                  onChange={event => form.setValue("sheet1.commissionPercentage", event.target.value === "" ? undefined : Number(event.target.value), { shouldDirty: true, shouldValidate: true })} />
                <p className="mt-1 text-xs text-muted">Enter a percentage from 0 to 100.</p>
              </Field>
            </div> : null}
          </fieldset>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Shipping Address" error={errors.sheet1?.shippingToSummary?.message}>
              <textarea className={textAreaClass} {...form.register("sheet1.shippingToSummary")} />
            </Field>
            <Field label="Notes">
              <textarea readOnly={isReorder} className={textAreaClass} {...form.register("sheet1.notes")} />
            </Field>
          </div>
        </Card>
      ) : null}

      {step === 2 && orderType === "descriptive" ? <Card className="mb-4 p-5">
        <fieldset disabled={isReorder}>
        <Field label="Descriptive entry">
          <select className={inputClass} value={descriptiveMode} onChange={event => changeEntry("descriptive", event.target.value as DescriptiveMode)}>
            <option value="individual">Individual</option>
            <option value="multiple_schools">Multiple Schools</option>
            <option value="multiple_group">Group</option>
          </select>
        </Field>
        {isGroup && isReorder ? <p className="mt-3 text-sm">End-school group: {endUserGroupCode}</p> : null}
        {isGroup && !isReorder ? <Field label="End-school group" error={errors.sheet1?.endUserGroupCode?.message}>
          <ReferencePicker kind="group"
            schools={endUserGroupCode && !groups.some(group => group.schoolCode === endUserGroupCode)
              ? [...groups, { optionKey: endUserGroupCode, schoolCode: endUserGroupCode, schoolName: "Saved group", addressSummary: "" }]
              : groups}
            selectedKey={groups.find(group => group.schoolCode === endUserGroupCode)?.optionKey ?? endUserGroupCode}
            onChange={optionKey => {
              const code = groups.find(group => group.optionKey === optionKey)?.schoolCode ?? optionKey;
              if (code === endUserGroupCode) return;
              const hasRows = form.getValues("combinedSchools").length || form.getValues("combinedItems").length;
              if (hasRows && !window.confirm("Changing the group will discard its participants and quantities. Continue?")) return;
              form.setValue("combinedSchools", []);
              form.setValue("combinedItems", []);
              form.setValue("sheet1.endUserGroupCode", code);
            }} />
        </Field> : null}
        </fieldset>
      </Card> : null}

      {step === 2 && orderType === "descriptive" && !isMultiple ? (
        <Card className="p-5">
          <div className="mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Order Sheet 2A</h2>
              <p className="text-sm text-muted">{isReorder ? "Enter new item quantities for the original end school." : "Select one school and enter its item quantities."}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
            <Field label="School">
              {isReorder ? <p className="py-2 text-sm">{reorderSchool?.schoolCode} - {reorderSchool?.schoolName}</p> : <ReferencePicker
                schools={schools}
                selectedKey={activeDescriptiveSchoolKey}
                onChange={optionKey => {
                  const nextCode = schools.find(school => school.optionKey === optionKey)?.schoolCode;
                  const currentRows = form.getValues("descriptiveRows");
                  if (currentRows.length && nextCode !== currentRows[0].schoolCode) {
                    if (!window.confirm("Changing the school will discard its item quantities. Continue?")) return;
                    form.setValue("descriptiveRows", []);
                  }
                  setSelectedDescriptiveSchoolKey(optionKey);
                }}
              />}
            </Field>
            {renderExecutivePicker(activeDescriptiveSchool?.schoolCode)}
            </div>
            <ItemSelectionFilters
              categories={categoryOptions}
              customisations={customisationOptions}
              categoryCode={selectedCategoryCode}
              customisationCode={selectedCustomisationCode}
              onCategoryChange={setSelectedCategoryCode}
              onCustomisationChange={setSelectedCustomisationCode}
            />
            {activeDescriptiveSchool ? <ItemQuantityTable
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
            /> : <p className="text-sm text-muted">Choose a school to enter its item quantities.</p>}
          </div>
        </Card>
      ) : null}

      {step === 2 && orderType === "ambiguous" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Ambiguous Entry</h2>
          <p className="mb-4 text-sm text-muted">Enter item quantities in Order Sheet 2B2.</p>
          <div>
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
        </Card>
      ) : null}

      {step === 2 && isMultiple ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">{isGroup ? "Group" : "Multiple Schools"} Entry</h2>
          <p className="mb-4 text-sm text-muted">
            {isReorder ? "The participating schools are copied from the original order." : isGroup ? "Choose the schools participating in this order. GS schools come from the selected group." : "Select at least two schools."} Enter one shared total per item for all participating schools.
          </p>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {isReorder ? <div>
              <h3 className="mb-3 font-semibold text-ink">Participating Schools</h3>
              <div className="space-y-3">{watchedCombinedSchools.map(school => <div key={school.schoolCode} className="rounded border border-line p-3 text-sm">
                <p>{school.schoolCode} - {school.schoolName}</p>
                {renderExecutivePicker(school.schoolCode)}
              </div>)}</div>
            </div> : (<>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">Order Sheet 2C1 Participating Schools</h3>
                {!hasGsParticipants ? <SubmitButton type="button" variant="secondary" onClick={appendCombinedSchool} disabled={combinedSchools.fields.length >= schools.length}>
                  <Plus className="mr-2 h-4 w-4" /> Add school
                </SubmitButton> : null}
              </div>
              <div className="space-y-3">
                {hasGsParticipants ? <>
                  <p className="text-sm text-muted">{watchedCombinedSchools.length} of {gsSchoolOptions.length} schools selected. Uncheck schools that are not participating. Selected PR-only members receive PT codes when saved.</p>
                  <p className="text-sm text-muted">Use Convert to PT to assign a code now. The PT code stays assigned even if you discard this order.</p>
                  <div className="flex gap-3">
                    <button type="button" className="focus-ring text-sm font-semibold text-brand-dark" onClick={() => form.setValue("combinedSchools", gsSchoolOptions, { shouldDirty: true, shouldValidate: true })}>Select all</button>
                    <button type="button" className="focus-ring text-sm font-semibold text-brand-dark" onClick={() => form.setValue("combinedSchools", [], { shouldDirty: true, shouldValidate: true })}>Deselect all</button>
                  </div>
                  {gsSchoolOptions.map(school => {
                    const member = selectedGs?.members?.find(member => member.schoolCode === school.schoolCode);
                    return <div key={member?.prCode ?? school.schoolCode} className="rounded border border-line p-3 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="focus-ring mt-1" checked={watchedCombinedSchools.some(row => row.schoolCode === school.schoolCode)} onChange={event => {
                            const rows = form.getValues("combinedSchools");
                            form.setValue("combinedSchools", event.target.checked ? [...rows, school] : rows.filter(row => row.schoolCode !== school.schoolCode), { shouldDirty: true, shouldValidate: true });
                          }} />
                          <span>{school.schoolCode} — {school.schoolName}
                            {member?.ptCode ? <span className="block text-xs text-muted">PR: {member.prCode}</span> : null}
                          </span>
                        </label>
                        {member && !member.ptCode ? <button type="button" className="focus-ring shrink-0 rounded border border-line px-3 py-1 text-sm font-semibold text-brand-dark disabled:opacity-50" disabled={!!convertingPrCode || isPending} onClick={() => convertSchool(member.prCode)}>
                          {convertingPrCode === member.prCode ? "Converting..." : "Convert to PT"}
                        </button> : null}
                      </div>
                      {conversionError && conversionError.prCode === member?.prCode ? <p role="alert" className="mt-2 text-sm text-red-700">{conversionError.message}</p> : null}
                      {watchedCombinedSchools.some(row => row.schoolCode === school.schoolCode) ? <div className="mt-3">{renderExecutivePicker(school.schoolCode)}</div> : null}
                    </div>;
                  })}
                </> : combinedSchools.fields.map((field, index) => (
                  <LineRow key={field.id} onRemove={() => combinedSchools.remove(index)}>
                    <div className="min-w-0 space-y-3">
                    <Field label="School">
                    <ReferencePicker
                      schools={schools.filter((school) => {
                        const selectedCode = form.watch(`combinedSchools.${index}.schoolCode`);
                        return school.schoolCode === selectedCode || !form.getValues("combinedSchools").some((row, rowIndex) => rowIndex !== index && row.schoolCode === school.schoolCode);
                      })}
                      selectedKey={findSchoolOptionByStoredValue(schools, form.watch(`combinedSchools.${index}.schoolCode`), form.watch(`combinedSchools.${index}.schoolName`))?.optionKey ?? ""}
                      onChange={(optionKey) => setCombinedSchool(index, optionKey)}
                    />
                    </Field>
                    {renderExecutivePicker(form.watch(`combinedSchools.${index}.schoolCode`))}
                    </div>
                  </LineRow>
                ))}
              </div>
            </div>
            </>)}
            <div>
              <h3 className="mb-3 font-semibold text-ink">Order Sheet 2C2 Pooled Items</h3>
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
                  quantityForItem={(item) => watchedCombinedItems.find((entry) => entry.itemCode === item.itemCode)?.pooledQuantity}
                  onQuantityChange={setCombinedItemQuantity}
                />
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {errors.schoolExecutives?.message ? <p role="alert" className="text-sm text-red-700">{errors.schoolExecutives.message}</p> : null}

      {step >= 2 && orderType === "descriptive" ? <EndUserTypesPreview
        schools={distinctEndUsers(isMultiple ? watchedCombinedSchools : activeDescriptiveSchool ? [activeDescriptiveSchool] : watchedDescriptiveRows)}
        sessionYear={form.watch("sheet1.sessionYear")}
        orderSheet1Id={orderSheet1Id}
      /> : null}

      {step === 2 ? <div className="space-y-1 text-sm text-red-700">
        {[errors.descriptiveRows, errors.ambiguousSchools, errors.ambiguousItems, errors.combinedSchools, errors.combinedItems].map((error, index) => error?.message || error?.root?.message ? <p key={index}>{error.message ?? error.root?.message}</p> : null)}
      </div> : null}

      {step === 3 ? (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-ink">Review</h2>
          <ReviewBlock values={form.getValues()} orderEnteredDate={orderEnteredDate} />
          {executiveSchools.length ? <div className="mt-4 space-y-2 text-sm"><h3 className="font-semibold">School executives</h3>{executiveSchools.map(school => {
            const value = watchedExecutives.find(row => row.schoolCode === school.schoolCode);
            return <p key={school.schoolCode}>{school.schoolName}: {value?.name || "Not assigned"}{value?.incumbentCode ? ` — ${value.incumbentCode}` : ""}</p>;
          })}</div> : null}
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Lock/Finalize</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Creating this order saves it as a draft with the correct sheet rows. Open the order
            details page to lock it, then finalize it into Order Sheet 3. You can update the
            order freely until it is finalized, while keeping the same order number.
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

function ReferencePicker({
  schools,
  selectedKey,
  onChange,
  kind = "school"
}: {
  schools: SchoolRef[];
  selectedKey: string;
  onChange: (optionKey: string) => void;
  kind?: "school" | "group";
}) {
  const optionsId = useId();
  const selectedSchool = useMemo(
    () => schools.find((school) => school.optionKey === selectedKey),
    [schools, selectedKey]
  );
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalizedQuery) {
      return schools.slice(0, 50);
    }

    return schools
      .filter(
        (school) =>
          school.schoolCode.toLowerCase().includes(normalizedQuery) ||
          school.schoolName.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 50);
  }, [normalizedQuery, schools]);
  const displayValue = isOpen ? query : selectedSchool ? `${selectedSchool.schoolCode} - ${selectedSchool.schoolName}${selectedSchool.groupType ? ` (${selectedSchool.groupType})` : ""}` : "";

  return (
    <div className="relative">
      <input
        className={inputClass}
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setIsOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        placeholder={`Search ${kind} code or name`}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={optionsId}
        aria-autocomplete="list"
      />
      {isOpen ? (
        <div
          id={optionsId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-white shadow-lg"
        >
          {matches.length > 0 ? (
            matches.map((school) => (
              <button
                key={school.optionKey}
                type="button"
                role="option"
                aria-selected={school.optionKey === selectedKey}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-canvas ${
                  school.optionKey === selectedKey ? "bg-canvas" : ""
                }`}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  onChange(school.optionKey);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <span className="font-medium text-ink">{school.schoolCode}</span>
                <span className="ml-2 text-muted">{school.schoolName}</span>
                {school.groupType ? <span className="ml-2 text-xs text-muted">{school.groupType}</span> : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted">No {kind === "group" ? "groups" : "schools"} match that search.</div>
          )}
        </div>
      ) : null}
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
  const quantityTableRef = useRef<HTMLDivElement>(null);

  function focusNextQuantity(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const quantityInputs = quantityTableRef.current?.querySelectorAll<HTMLInputElement>(
      'input[type="number"]'
    );
    if (!quantityInputs) {
      return;
    }

    const currentIndex = Array.from(quantityInputs).indexOf(event.currentTarget);
    quantityInputs[currentIndex + 1]?.focus();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-line bg-canvas p-3 text-sm text-muted">
        No active English items were found for this category and customization.
      </div>
    );
  }

  return (
    <div ref={quantityTableRef} className="overflow-x-auto rounded-md border border-line">
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
                  onKeyDown={focusNextQuantity}
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
    <div className="grid grid-cols-[minmax(0,1fr)_44px] items-start gap-3 rounded-md border border-line bg-canvas p-3">
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

function ReviewBlock({ values, orderEnteredDate }: { values: CreateOrderInput; orderEnteredDate: string }) {
  return (
    <div className="grid gap-4 text-sm xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-md border border-line bg-canvas p-4">
        <p className="font-semibold text-ink">Sheet 1</p>
        <p className="mt-2 text-muted">Billing: {values.sheet1.billingToName}</p>
        <p className="text-muted">Shipping: {values.sheet1.shippingToName}</p>
        <p className="text-muted">Contact numbers: {values.sheet1.contactNumbers?.filter(number => number.trim()).join(", ") || "—"}</p>
        {values.sheet1.commissionEnabled ? <p className="text-muted">Commission: {values.sheet1.commissionPartyCode} · {values.sheet1.commissionPercentage}%</p> : null}
        <p className="text-muted">Placed: {values.sheet1.orderPlacedDate}</p>
        <p className="text-muted">Received: {values.sheet1.orderReceivedDate}</p>
        <p className="text-muted">Expected: {values.sheet1.expectedDeliveryDate}</p>
        <p className="text-muted">Order Entered Date: {orderEnteredDate}</p>
        <p className="text-muted">Address: {values.sheet1.shippingToSummary}</p>
        <p className="text-muted">Type: {orderTypeLabel(values.sheet1)}</p>
      </div>
      <div className="rounded-md border border-line bg-canvas p-4">
        <p className="font-semibold text-ink">Detail rows</p>
        {values.sheet1.orderType === "descriptive" && !isPooledOrder(values.sheet1) ? (
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
        ) : values.sheet1.orderType === "ambiguous" ? (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase text-muted">Sheet 2B2 Item quantities</p>
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
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Sheet 2C1 Participating Schools</p>
              <div className="mt-2 space-y-2">
                {values.combinedSchools.map((row, index) => (
                  <div key={`${row.schoolCode}-${index}`} className="rounded-md border border-line bg-white px-3 py-2">
                    <span className="font-medium text-ink">{row.schoolCode}</span>
                    <span className="ml-2 text-muted">{row.schoolName}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Sheet 2C2 Pooled Items</p>
              <div className="mt-2 space-y-2">
                {values.combinedItems.map((row, index) => (
                  <div key={`${row.itemCode}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2">
                    <span><span className="font-medium text-ink">{row.itemCode}</span><span className="block text-muted">{row.itemName}</span></span>
                    <span className="font-semibold text-ink">{row.pooledQuantity}</span>
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
