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
