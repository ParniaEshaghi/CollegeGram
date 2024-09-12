import { DataSource, Repository } from "typeorm";
import { MessageEntity } from "./entity/message.entity";
import { CreateMessage, Message } from "./model/message.model";
import { Thread } from "../thread/model/thread.model";

export class MessageRepository {
    private messageRepo: Repository<MessageEntity>;
    constructor(private appDataSource: DataSource) {
        this.messageRepo = appDataSource.getRepository(MessageEntity);
    }

    public async create(message: CreateMessage): Promise<Message> {
        return await this.messageRepo.save(message);
    }

    public async getThreadUnreadCount(thread: Thread): Promise<number> {
        const threadUnreadCount = await this.messageRepo.count({
            where: { thread: thread, isRead: false },
        });
        return threadUnreadCount;
    }

    public async getThreadLastMessage(thread: Thread): Promise<MessageEntity> {
        const lastMessage = await this.messageRepo.find({
            where: { thread: thread },
            take: 1,
            order: { createdAt: "DESC" },
        });

        return lastMessage[0];
    }

    public async getThreadMessages(
        thread: Thread,
        page: number,
        limit: number
    ) {
        const [response, total] = await this.messageRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                thread: thread,
            },
            relations: ["sender"],

            order: {
                createdAt: "DESC",
            },
        });

        return { data: response, total: total };
    }
}
