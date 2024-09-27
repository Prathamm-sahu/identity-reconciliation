import { z } from "zod";

export const IdentityValidator = z.object({
  email: z.string().email(),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number length should be of 10" })
    .max(10, { message: "Phone number length should be of 10" }),
});


