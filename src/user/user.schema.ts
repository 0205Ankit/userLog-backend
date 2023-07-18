import z from "zod"

export const validateIdSchema = z.object({
  id: z.string(),
});

export const userSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  email: z.string().email().trim(),
  phone: z.string().min(10).max(10).trim(),
  gender: z.string().min(1).trim(),
  age:z.number().min(1).nonnegative(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  email: z.string().email().trim(),
  phone: z.string().min(10).max(10).trim(),
  gender: z.string().min(1).trim(),
  age: z.number().min(1).nonnegative(),
  id: z.number().min(1).nonnegative(),
});