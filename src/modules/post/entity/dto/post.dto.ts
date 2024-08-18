import { z } from "zod";

export const postDto = z.object({
    caption: z.string(),
    mentions: z.string().array(),
});

export type PostDto = z.infer<typeof postDto>;
