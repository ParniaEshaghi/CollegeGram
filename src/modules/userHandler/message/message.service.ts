import { Thread } from "../thread/model/thread.model";
import { User } from "../user/model/user.model";
import { MessageRepository } from "./message.repository";
import { toShownMessage } from "./model/message.model";

export class MessageService {
    constructor(private messageRepo: MessageRepository) {}

    public async newMessage(
        sender: User,
        thread: Thread,
        text?: string,
        image?: string
    ) {
        return await this.messageRepo.create({ sender, thread, text, image });
    }

    public async getThreadUnreadCount(thread: Thread) {
        return await this.messageRepo.getThreadUnreadCount(thread);
    }

    public async getThreadLastMessage(thread: Thread) {
        return await this.messageRepo.getThreadLastMessage(thread);
    }

    public async getThreadMessages(
        thread: Thread,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const messages = await this.messageRepo.getThreadMessages(
            thread,
            page,
            limit
        );

        return {
            data: messages.data.map((message) =>
                toShownMessage(message, baseUrl)
            ),
            total: messages.total,
        };
    }
}
