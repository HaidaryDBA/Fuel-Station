import { z } from "zod";

// Shop Settings Schema
export const shopSettingsSchema = z.object({
  shop_name: z.string().min(1, "Shop name is required"),
  phone_number: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(20, "Phone number is too long"),
  contact_email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
});


// Email Settings Schema
export const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z.number({
    message: "Port number is required",
    invalid_type_error: "Port number is required",
  }),
  smtp_username: z.string().min(1, "SMTP username is required"),
  smtp_password: z.string().optional(),
  from_email: z.string().email("Invalid from email address"),
});

