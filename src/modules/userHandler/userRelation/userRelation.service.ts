import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../user/model/user.model";
import { UserService } from "../user/user.service";
import {
    followerFollowingListUserResponse,
    toFollowerFollowingListUser,
    toProfile,
    UserRelation,
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
        const followStatus = relation ? relation.followStatus : "not followed";
        return followStatus;
    }

    async getRequestStatus(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const relation = await this.userRelationRepo.checkExistance(
            follower,
            user
        );
        if (!relation) {
            throw new BadRequestError();
        }
        return relation.followStatus;
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
        const followStatus = await this.getFollowStatus(
            user,
            following.username
        );
        if (followStatus === "accepted") {
            throw new BadRequestError();
        }
        const type = "follow";

        if (following.profileStatus === "public") {
            const relation: UserRelation = {
                follower: user,
                following,
                type,
                followStatus: "accepted",
            };
            await this.userRelationRepo.createFollow(relation);
            return { message: "User followed" };
        } else {
            if (followStatus === "pending") {
                throw new BadRequestError();
            }
            const relation: UserRelation = {
                follower: user,
                following,
                type,
                followStatus: "pending",
            };
            await this.userRelationRepo.createFollowRequest(relation);
            return { message: "Follow request sent" };
        }
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
        const followStatus = await this.getFollowStatus(
            user,
            following.username
        );
        if (followStatus === ("not followed" || "rejected")) {
            throw new BadRequestError();
        }
        const type = "follow";
        if (followStatus === "accepted") {
            await this.userRelationRepo.deleteFollow(user, following, type);
            return { message: "User unfollowed" };
        } else {
            if (followStatus !== "pending") {
                throw new BadRequestError();
            }
            await this.userRelationRepo.deleteFollowRequest(
                user,
                following,
                type
            );
            return { message: "Follow request rescinded" };
        }
    }

    public async acceptFollowRequest(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const requestStatus = await this.getRequestStatus(
            user,
            follower_username
        );

        if (requestStatus !== "pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            type: "follow",
            followStatus: "accepted",
        };
        await this.userRelationRepo.createFollowAccepted(relation);
        return { message: "Follow request accepted" };
    }

    public async rejectFollowRequest(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const requestStatus = await this.getRequestStatus(
            user,
            follower_username
        );

        if (requestStatus !== "pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            type: "follow",
            followStatus: "rejected",
        };
        await this.userRelationRepo.createFollowRejected(relation);
        return { message: "Follow request rejected" };
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

        const followStatus = await this.getFollowStatus(session_user, username);
        return toProfile(user, followStatus, posts, baseUrl);
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
