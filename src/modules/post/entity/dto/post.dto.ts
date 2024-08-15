import { z } from "zod";

export const postDto = z.object({
    caption: z.string(),
    mentions: z.array(z.string()),
});

export type PostDto = z.infer<typeof postDto>;
