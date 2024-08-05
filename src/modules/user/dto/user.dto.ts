import { z } from "zod";

export const signUpDto = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
});

export type SignUpDto = z.infer<typeof signUpDto>;
