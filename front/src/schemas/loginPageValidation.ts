import z from "zod";

// Login Schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "نام کاربری ضروری است" })
    .max(50, { message: "نام کاربری بیشتر از ۵۰ کاراکتر بوده نمیتواند!" }),
  password: z
    .string()
    .min(6, { message: "رمز عبور حد اقل ۶ کاراکتر باشد" })
    .max(100, { message: "رمز عبور بیشتر از ۱۰۰ کاراکتر بوده نمیتواند" }),
});

// Change Password Schema
export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, { message: " رمز عبور فعلی ضروری است!" }),
    new_password: z
      .string()
      .min(8, { message: " رمز عبور حد اقل باید ۸ کاراکتر باشد!" })
      .regex(/[A-Z]/, { message: " رمز عبور حد اقل یک حروف کلان داشته باشد" })
      .regex(/[a-z]/, { message: " رمز عبور حد اقل یک حروف کوچک داشته باشد!" })
      .regex(/[0-9]/, { message: " رمز عبور حد اقل یک عدد داشته باشد!" }),
    confirm_password: z.string().min(1, { message: " لطفا پسورد تان را تایید نمایید!" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: " رمز عبور مطابقت ندارد!",
    path: ["confirm_password"],
  });

// Infer types from schemas
export type LoginFormInputs = z.infer<typeof loginSchema>;
export type ChangePasswordFormInputs = z.infer<typeof changePasswordSchema>;
