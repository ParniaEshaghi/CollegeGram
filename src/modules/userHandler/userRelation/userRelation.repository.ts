import { DataSource, Repository } from "typeorm";
import { UserRelationEntity } from "./entity/userRelation.entity";
import { followerFollowing, UserRelation } from "./model/userRelation.model";
import { User } from "../user/model/user.model";
import { UserEntity } from "../user/entity/user.entity";

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

    public async checkExistance(
        follower: User,
        following: User
    ): Promise<UserRelation | null> {
        const reponse = await this.userRelationRepo.findOne({
            where: {
                follower: { username: follower.username },
                following: { username: following.username },
            },
        });

        return reponse;
    }

    public async getFollowers(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { following: { username: user.username } },
            relations: ["follower"],
        });

        return { data: response.map((res) => res.follower), total: total };
    }

    public async getFollowings(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { follower: { username: user.username } },
            relations: ["following"],
        });

        return { data: response.map((res) => res.following), total: total };
    }
}
