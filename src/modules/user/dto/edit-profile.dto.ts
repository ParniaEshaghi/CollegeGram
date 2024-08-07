import { z } from "zod";

export const editProfileDto = z.object({
    password: z.string().optional(),
    email: z.string().email().min(1),
    firstName: z.string(),
    lastName: z.string(),
    profileStatus: z.enum(["public", "private"]),
    bio: z.string(),
});

export type EditProfileDto = z.infer<typeof editProfileDto>;