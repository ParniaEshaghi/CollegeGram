import { MessageService } from "../message/message.service";
import { User } from "../user/model/user.model";
import { UserService } from "../user/user.service";
import { toListThread } from "./model/thread.model";
import { ThreadRepository } from "./thread.repository";

export class ThreadService {
    constructor(
        private threadRepo: ThreadRepository,
        private messageService: MessageService,
        private userService: UserService
    ) {}

    public async addNewThread(participants: User[]) {
        return await this.threadRepo.create({ participants });
    }

    public async getUserThreads(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const threads = await this.threadRepo.getUserThreads(user, page, limit);
        const shownThreads = [];
        for (const thread of threads.data) {
            const unreadMessages =
                await this.messageService.getThreadUnreadCount(thread);
            const lastMessage = await this.messageService.getThreadLastMessage(
                thread
            );
            const otherParticipant = thread.participants.filter(
                (participant) => participant.username !== user.username
            );

            shownThreads.push(
                toListThread(
                    otherParticipant[0],
                    unreadMessages,
                    lastMessage,
                    baseUrl
                )
            );
        }

        const response = {
            data: shownThreads,
            meta: {
                page: page,
                limit: limit,
                total: shownThreads.length,
                totalPage: Math.ceil(shownThreads.length / limit),
            },
        };

        return response;
    }

    public async getThread(
        user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const otherParticipant = await this.userService.getUserByUsername(
            username
        );
        const existingThread = await this.threadRepo.getThreadByParticipants([
            user,
            otherParticipant,
        ]);

        const thread = existingThread
            ? existingThread
            : await this.addNewThread([user, otherParticipant]);

        const threadMessages = await this.messageService.getThreadMessages(
            thread,
            page,
            limit,
            baseUrl
        );

        const response = {
            data: threadMessages.data,
            meta: {
                page: page,
                limit: limit,
                total: threadMessages.total,
                totalPage: Math.ceil(threadMessages.total / limit),
            },
        };

        return response;
    }
}
