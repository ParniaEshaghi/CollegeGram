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
    toProfileFollowStatus,
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
        const reverse_followStatus = await this.getFollowStatus(
            following,
            user.username
        );
        if (
            (followStatus !== "unfollowed" &&
                followStatus !== "not followed" &&
                followStatus !== "request rejected" &&
                followStatus !== "request rescinded" &&
                followStatus !== "follower deleted" &&
                followStatus !== "unblocked") ||
            reverse_followStatus === "blocked"
        ) {
            throw new BadRequestError();
        }

        if (following.profileStatus === "public") {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "followed",
            };
            await this.userRelationRepo.createFollow(relation);
            return { message: "User followed" };
        } else {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "request pending",
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
        if (
            followStatus === "not followed" ||
            followStatus === "request rejected" ||
            followStatus === "unfollowed" ||
            followStatus === "blocked" ||
            followStatus === "request rescinded" ||
            followStatus === "follower deleted"
        ) {
            throw new BadRequestError();
        }
        if (
            followStatus === "request accepted" ||
            followStatus === "followed"
        ) {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "unfollowed",
            };
            await this.userRelationRepo.deleteFollow(relation);
            return { message: "User unfollowed" };
        } else {
            const relation: UserRelation = {
                follower: user,
                following,
                followStatus: "request rescinded",
            };
            await this.userRelationRepo.deleteFollowRequest(relation);
            return { message: "Follow request rescinded" };
        }
    }

    public async deleteFollower(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (
            followStatus !== "followed" &&
            followStatus !== "request accepted"
        ) {
            throw new BadRequestError();
        }
        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "follower deleted",
        };
        await this.userRelationRepo.deleteFollow(relation);
        return { message: "Follower deleted" };
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

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );

        if (followStatus !== "request pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "request accepted",
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
        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );

        if (followStatus !== "request pending") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "request rejected",
        };
        await this.userRelationRepo.createFollowRejected(relation);
        return { message: "Follow request rejected" };
    }

    public async block(user: User, following_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }

        const relation: UserRelation = {
            follower: user,
            following,
            followStatus: "blocked",
        };
        await this.userRelationRepo.createBlocked(relation);
        return { message: "User blocked" };
    }

    public async unblock(user: User, following_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }

        const relation: UserRelation = {
            follower: user,
            following,
            followStatus: "unblocked",
        };
        await this.userRelationRepo.createUnBlocked(relation);
        return { message: "User unblocked" };
    }

    public async addCloseFriend(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (
            followStatus !== "followed" &&
            followStatus !== "request accepted"
        ) {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "close",
        };
        await this.userRelationRepo.createCloseFriend(relation);
        return { message: "User added to close friends" };
    }

    public async removeCloseFriend(user: User, follower_username: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }

        const followStatus = await this.getFollowStatus(
            follower,
            user.username
        );
        if (followStatus !== "close") {
            throw new BadRequestError();
        }

        const relation: UserRelation = {
            follower,
            following: user,
            followStatus: "followed",
        };
        await this.userRelationRepo.deleteCloseFriend(relation);
        return { message: "User removed from close friends" };
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

        const followStatus = await this.getFollowStatus(session_user, username);
        const profileFollowStatus = toProfileFollowStatus(followStatus);

        if (
            profileFollowStatus === "blocked" ||
            (user.profileStatus === "private" &&
                profileFollowStatus !== "followed")
        ) {
            return toProfile(user, profileFollowStatus, [], baseUrl);
        }

        const posts = await this.userService.getUserPosts(username, baseUrl);
        if (followStatus === "followed") {
            const normalPosts = posts.filter(
                (post) => post.close_status === false
            );
            return toProfile(user, profileFollowStatus, normalPosts, baseUrl);
        }
        return toProfile(user, profileFollowStatus, posts, baseUrl);
    }

    public async allFolloweList(user: User) {
        return await this.userRelationRepo.getAllFollowers(user);
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

    public async allFolloweingList(username: string) {
        const user = await this.userService.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }
        const followingList = await this.userRelationRepo.getAllFollowings(
            user
        );
        return followingList;
    }

    public async closeFriendList(
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
        const closeFriendList = await this.userRelationRepo.getCloseFriends(
            user,
            page,
            limit
        );

        return {
            data: closeFriendList.data.map((follower) =>
                toFollowerFollowingListUser(follower, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: closeFriendList.total,
                totalPage: Math.ceil(closeFriendList?.total / limit),
            },
        };
    }

    public async blockList(
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

        const blockList = await this.userRelationRepo.getBlockList(
            user,
            page,
            limit
        );

        return {
            data: blockList.data.map((followeing) =>
                toFollowerFollowingListUser(followeing, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: blockList.total,
                totalPage: Math.ceil(blockList?.total / limit),
            },
        };
    }
}
