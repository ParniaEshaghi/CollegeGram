import { DataSource, Repository } from "typeorm";
import { UserRelationEntity } from "./entity/userRelation.entity";
import { User } from "../model/user.model";
import { UserEntity } from "../entity/user.entity";
import { UserRelation } from "./model/userRelation.model";

export class UserRelationRepository {
    private userRelationRepo: Repository<UserRelationEntity>;

    constructor(private appDataSource: DataSource) {
        this.userRelationRepo = appDataSource.getRepository(UserRelationEntity);
    }

    public async create(follower: User, following: User): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const userRepo = manager.getRepository(UserEntity);
            const userRelationRepo = manager.getRepository(UserRelationEntity);
            await userRelationRepo.save({ follower, following });
            await userRepo.update(
                { username: follower.username },
                { following_count: () => "following_count + 1" }
            );
            await userRepo.update(
                { username: following.username },
                { follower_count: () => "follower_count + 1" }
            );
        });
    }

    public async delete(follower: User, following: User): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const userRepo = manager.getRepository(UserEntity);
            const userRelationRepo = manager.getRepository(UserRelationEntity);
            await userRelationRepo.softDelete({ follower, following });
            await userRepo.update(
                { username: follower.username },
                { following_count: () => "following_count - 1" }
            );
            await userRepo.update(
                { username: following.username },
                { follower_count: () => "follower_count - 1" }
            );
        });
    }

    public checkExistance(
        follower: User,
        following: User
    ): Promise<UserRelation | null> {
        return this.userRelationRepo.findOne({
            where: { follower, following },
        });
    }
}
