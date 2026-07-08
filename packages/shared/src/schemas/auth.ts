import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, 'username may only contain letters, numbers, - and _'),
  password: z.string().min(8).max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  plan: z.enum(['FREE', 'PRO']),
});
export type AuthUser = z.infer<typeof authUserSchema>;
