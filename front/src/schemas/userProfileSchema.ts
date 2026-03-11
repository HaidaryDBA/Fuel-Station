// profile.schema.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z.string().min(2, " اسم حد اقل باید دو کاراکتر داشته باشد!"),
  lastName: z.string().min(2, " اسم حد اقل باید ۲ کاراکتر داشته باشد!"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  phone: z.string().optional(), // Or add a more specific regex if needed
});

// This creates a TypeScript type from your schema
export type UserProfileFormData = z.infer<typeof userProfileSchema>;