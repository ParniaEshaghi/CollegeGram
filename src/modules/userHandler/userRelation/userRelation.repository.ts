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

    public async createFollow(relation: UserRelation): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const userRepo = manager.getRepository(UserEntity);
            const userRelationRepo = manager.getRepository(UserRelationEntity);
            await userRelationRepo.save(relation);
            await userRepo.update(
                { username: relation.follower.username },
                { following_count: () => "following_count + 1" }
            );
            await userRepo.update(
                { username: relation.following.username },
                { follower_count: () => "follower_count + 1" }
            );
        });
    }

    public async deleteFollow(userRelation: UserRelation): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const userRepo = manager.getRepository(UserEntity);
            const userRelationRepo = manager.getRepository(UserRelationEntity);
            await userRelationRepo.softDelete({
                follower: userRelation.follower,
                following: userRelation.following,
            });
            await userRelationRepo.save(userRelation);
            await userRepo.update(
                { username: userRelation.follower.username },
                { following_count: () => "following_count - 1" }
            );
            await userRepo.update(
                { username: userRelation.following.username },
                { follower_count: () => "follower_count - 1" }
            );
        });
    }

    public async createFollowRequest(
        userRelation: UserRelation
    ): Promise<void> {
        await this.userRelationRepo.save(userRelation);
    }

    public async deleteFollowRequest(
        userRelation: UserRelation
    ): Promise<void> {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
    }

    public async createFollowAccepted(
        userRelation: UserRelation
    ): Promise<void> {
        await this.deleteFollowRequest(userRelation);
        await this.createFollow(userRelation);
    }

    public async createFollowRejected(relation: UserRelation): Promise<void> {
        await this.deleteFollowRequest(relation);
        await this.userRelationRepo.save(relation);
    }

    public async createBlocked(userRelation: UserRelation): Promise<void> {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
        await this.userRelationRepo.softDelete({
            follower: userRelation.following,
            following: userRelation.follower,
        });
        await this.userRelationRepo.save(userRelation);
    }

    public async createUnBlocked(userRelation: UserRelation): Promise<void> {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
        await this.userRelationRepo.save(userRelation);
    }

    public async createCloseFriend(userRelation: UserRelation): Promise<void> {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
        await this.userRelationRepo.save(userRelation);
    }

    public async deleteCloseFriend(userRelation: UserRelation): Promise<void> {
        await this.userRelationRepo.softDelete({
            follower: userRelation.follower,
            following: userRelation.following,
        });
        await this.userRelationRepo.save(userRelation);
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
            where: {
                following: { username: user.username },
                followStatus: "followed" || "request accepted" || "close",
            },
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
            where: {
                follower: { username: user.username },
                followStatus: "followed" || "request accepted" || "close",
            },
            relations: ["following"],
        });

        return { data: response.map((res) => res.following), total: total };
    }

    public async getCloseFriends(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                following: { username: user.username },
                followStatus: "close",
            },
            relations: ["follower"],
        });

        return { data: response.map((res) => res.follower), total: total };
    }

    public async getBlockList(
        user: User,
        page: number,
        limit: number
    ): Promise<followerFollowing> {
        const [response, total] = await this.userRelationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                follower: { username: user.username },
                followStatus: "blocked",
            },
            relations: ["following"],
        });

        return { data: response.map((res) => res.following), total: total };
    }
}
