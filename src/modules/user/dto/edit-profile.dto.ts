import { z } from "zod";

export const editProfileDto = z.object({
    password: z.string().optional(),
    email: z.string().email().min(1),
    firstname: z.string().default(""),
    lastname: z.string().default(""),
    profileStatus: z.enum(["public", "private"]),
    bio: z.string().default(""),
});

export type EditProfileDto = z.infer<typeof editProfileDto>;
