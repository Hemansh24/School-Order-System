import { z } from "zod";
import { DEFAULT_LANGUAGE_CODE, generateItemCode } from "@/lib/item-code";

const optionalText = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    return typeof value === "string" && value.trim() === "" ? undefined : value;
  },
  z.string().trim().optional()
);

const optionalInteger = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    return typeof value === "string" && value.trim() === "" ? undefined : value;
  },
  z.coerce.number().int().nonnegative().optional()
);

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  },
  z.boolean().optional()
);

const optionalDate = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    return typeof value === "string" && value.trim() === "" ? undefined : value;
  },
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
    .optional()
);

export const schoolDetailsSchema = z.object({
  schoolName: z.string().trim().min(1, "School name is required"),
  address: optionalText,
  district: optionalText,
  state: optionalText,
  pincode: optionalText,
  contactPerson: optionalText,
  phone: optionalText,
  email: optionalText
});

export const createSchoolSchema = schoolDetailsSchema.extend({
  schoolCode: z.string().trim().min(1, "School code is required")
});

export const organisationDetailsSchema = z.object({
  groupCode: optionalText,
  organisationName: z.string().trim().min(1, "Organisation name is required"),
  address: optionalText,
  district: optionalText,
  state: optionalText,
  pinCode: optionalText,
  phone: optionalText,
  email: optionalText,
  website: optionalText,
  actionStatus: optionalText,
  remark: optionalText,
  academicYear: optionalText,
  strength: optionalInteger,
  boardType: optionalText,
  sessionStartFrom: optionalDate,
  minorityType: optionalText,
  saturdayStatus: optionalText,
  workingStatus: optionalBoolean
});

export const createOrganisationSchema = organisationDetailsSchema.extend({
  prCode: z.string().trim().min(1, "PR code is required")
});

export const lookupSchoolSchema = z
  .object({
    schoolName: optionalText,
    address: optionalText,
    district: optionalText,
    state: optionalText,
    pincode: optionalText,
    contactPerson: optionalText,
    phone: optionalText,
    email: optionalText
  })
  .refine(
    (data) =>
      Boolean(data.schoolName || data.address || data.district || data.state || data.pincode),
    {
      message: "Enter at least one search field.",
      path: ["schoolName"]
    }
  );

export const createVendorSchema = z.object({
  vendorCode: z.string().trim().min(1, "Vendor code is required"),
  vendorName: z.string().trim().min(1, "Vendor name is required"),
  vendorType: optionalText,
  vendorRating: optionalText,
  address: optionalText,
  contactPerson: optionalText,
  phone: optionalText,
  email: optionalText,
  schoolIds: z.array(z.coerce.number().int().positive()).min(1, "Choose at least one school")
});

export const createItemSchema = z.object({
  itemCode: z.string().trim().min(1, "Item code is required"),
  itemName: z.string().trim().min(1, "Item name is required"),
  categoryCode: z.string().trim().min(1, "Category code is required"),
  categoryType: optionalText,
  subCategoryCode: z.string().trim().min(1, "Sub-category code is required"),
  languageCode: z
    .string()
    .trim()
    .default(DEFAULT_LANGUAGE_CODE)
    .transform((value) => value || DEFAULT_LANGUAGE_CODE),
  customisationCode: z.string().trim().min(1, "Customisation code is required"),
  customisationName: optionalText,
  editionCode: z.string().trim().min(1, "Edition code is required"),
  isbnNumber: optionalText,
  mrp: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().positive("MRP must be greater than 0").optional()
  ),
  obsolete: z.boolean().default(false),
  active: z.boolean().default(false)
}).superRefine((data, ctx) => {
  const generatedCode = generateItemCode(data);
  if (data.itemCode !== generatedCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["itemCode"],
      message: `Item code must match ${generatedCode}`
    });
  }
});
