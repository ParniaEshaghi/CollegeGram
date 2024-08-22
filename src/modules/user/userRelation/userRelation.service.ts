import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { UserEntity } from "../entity/user.entity";
import { User } from "../model/user.model";
import { UserService } from "../user.service";
import {
    followerFollowingListUserResponse,
    toFollowerFollowingListUser,
    toProfile,
} from "./model/userRelation.model";
import { UserRelationRepository } from "./userRelation.repository";

export class UserRelationService {
    constructor(
        private userRelationRepo: UserRelationRepository,
        private userService: UserService
    ) {}

    async getFollowStatus(user: User, following_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const relation = await this.userRelationRepo.checkExistance(
            user,
            following
        );
        const follow_status = relation ? true : false;
        return follow_status;
    }

    public async follow(user: User, following_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const follow_status = await this.getFollowStatus(
            user,
            following.username
        );
        if (follow_status) {
            throw new BadRequestError();
        }
        await this.userRelationRepo.create(user, following);
        return { message: "User followed" };
    }

    public async unfollow(user: User, following_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const follow_status = await this.getFollowStatus(
            user,
            following.username
        );
        if (!follow_status) {
            throw new BadRequestError();
        }
        await this.userRelationRepo.delete(user, following);
        return { message: "User unfollowed" };
    }

    public async userProfile(
        session_user: User,
        username: string,
        baseUrl: string
    ) {
        if (!session_user) {
            throw new UnauthorizedError();
        }
        const user = await this.userService.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }

        const posts = await this.userService.getUserPosts(username, baseUrl);

        const follow_status = await this.getFollowStatus(
            session_user,
            username
        );
        return toProfile(user, follow_status, posts, baseUrl);
    }

    public async followerList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        if (!session_user) {
            throw new UnauthorizedError();
        }
        const user = await this.userService.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }

        const followerList = await this.userRelationRepo.getFollowers(
            user,
            page,
            limit
        );

        return {
            data: followerList.data.map((follower) =>
                toFollowerFollowingListUser(follower, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: followerList.total,
                totalPage: Math.ceil(followerList?.total / limit),
            },
        };
    }

    public async followeingList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        if (!session_user) {
            throw new UnauthorizedError();
        }
        const user = await this.userService.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }

        const followingList = await this.userRelationRepo.getFollowings(
            user,
            page,
            limit
        );

        return {
            data: followingList.data.map((followeing) =>
                toFollowerFollowingListUser(followeing, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: followingList.total,
                totalPage: Math.ceil(followingList?.total / limit),
            },
        };
    }
}
