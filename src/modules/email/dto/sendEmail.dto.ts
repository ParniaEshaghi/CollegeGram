import { string, z } from "zod";

export const sendMailDto = z.object({
    reciever: string().email().min(1),
    subject: string().min(1),
    text: string(),
});

export type SendMailDto = z.infer<typeof sendMailDto>;
