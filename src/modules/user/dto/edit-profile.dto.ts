import { z } from "zod";

export const editProfileDto = z.object({
    password: z.string().optional(),
    email: z.string().email().min(1),
    firstname: z.string(),
    lastname: z.string(),
    profileStatus: z.enum(["public", "private"]),
    bio: z.string(),
});

export type EditProfileDto = z.infer<typeof editProfileDto>;
