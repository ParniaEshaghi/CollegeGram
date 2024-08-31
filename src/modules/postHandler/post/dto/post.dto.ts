import { z } from "zod";

const arraySchema = z
    .union([z.array(z.string()), z.string()])
    .transform((arg) => (Array.isArray(arg) ? arg : [arg]));

export const postDto = z.object({
    caption: z.string(),
    mentions: arraySchema,
    close_status: z.enum(["close", "normal"]).default("normal"),
});

export type PostDto = z.infer<typeof postDto>;
