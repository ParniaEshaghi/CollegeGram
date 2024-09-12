import { DataSource, Repository } from "typeorm";
import { ThreadEntity } from "./entity/thread.entity";
import { CreateThread, Thread } from "./model/thread.model";
import { User } from "../user/model/user.model";

export class ThreadRepository {
    private threadRepo: Repository<ThreadEntity>;
    constructor(private appDataSource: DataSource) {
        this.threadRepo = appDataSource.getRepository(ThreadEntity);
    }

    public async create(thread: CreateThread): Promise<Thread> {
        return await this.threadRepo.save(thread);
    }

    public async getUserThreads(user: User, page: number, limit: number) {
        const query = this.threadRepo
            .createQueryBuilder("thread")
            .leftJoinAndSelect("thread.participants", "participant")
            .where("participant.username = :username", {
                username: user.username,
            })
            .skip((page - 1) * limit)
            .take(limit);

        const [threads, total] = await query.getManyAndCount();

        return { data: threads, total: total };
    }

    public async getThreadByParticipants(participants: User[]) {
        return await this.threadRepo.findOne({
            where: { participants: participants },
        });
    }
}
