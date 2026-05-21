import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

export const createSchoolSchema = z.object({
  schoolCode: z.string().trim().min(1, "School code is required"),
  schoolName: z.string().trim().min(1, "School name is required"),
  address: optionalText,
  contactPerson: optionalText,
  phone: optionalText,
  email: optionalText
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
  itemType: optionalText,
  subject: optionalText,
  classLevel: optionalText,
  publisher: optionalText,
  price: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().nonnegative("Price cannot be negative").optional()
  ),
  active: z.boolean().default(false)
});

