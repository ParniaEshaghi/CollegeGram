import { NotFoundError } from "../../utility/http-errors";
import {
    PostWithUsername,
    toPostPage,
    toProfilePost,
} from "../postHandler/post/model/post.model";
import { PostHandler } from "../postHandler/postHandler";
import { NotificationService } from "./notification/notification.service";
import { SavedPostService } from "./savedPost/savedPost.service";
import { EditProfileDto } from "./user/dto/edit-profile.dto";
import { LoginDto } from "./user/dto/login.dto";
import { SignUpDto } from "./user/dto/signup.dto";
import {
    toProfileInfo,
    User,
    UserWithoutPassword,
} from "./user/model/user.model";
import { UserService } from "./user/user.service";
import {
    followerFollowingListUserResponse,
    toProfile,
    toProfileFollowStatus,
} from "./userRelation/model/userRelation.model";
import { UserRelationService } from "./userRelation/userRelation.service";

export class UserHandler {
    constructor(
        private userService: UserService,
        private userRelationService: UserRelationService,
        private savedService: SavedPostService,
        private notificationService: NotificationService,
        private postHandler: PostHandler
    ) {}

    public async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        return this.userService.createUser(dto);
    }

    public async login(dto: LoginDto) {
        return this.userService.login(dto);
    }

    public async forgetPassword(credential: string) {
        return this.userService.forgetPassword(credential);
    }

    public async resetPassword(newPass: string, token: string) {
        return this.userService.resetPassword(newPass, token);
    }

    public getEditProfile(user: User, baseUrl: string) {
        return this.userService.getEditProfile(user, baseUrl);
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto,
        baseUrl: string
    ) {
        return this.userService.editProfile(
            user,
            pictureFilename,
            dto,
            baseUrl
        );
    }

    public async getProfileInfo(user: User, baseUrl: string) {
        const unreadNotifications =
            (await this.notificationService.getAllUserUnreadNotifications(
                user
            )) +
            (await this.notificationService.getAllUserFollowingsUnreadNotifications(
                user
            ));
        const posts = await this.getUserPosts(user.username, baseUrl);
        return toProfileInfo(user, posts, baseUrl, unreadNotifications);
    }

    public async getUserPosts(username: string, baseUrl: string) {
        const user = await this.userService.getUserByUsername(username);
        const posts = await this.userService.getUserPosts(username, baseUrl);
        const profilePosts: PostWithUsername[] = [];
        for (const post of posts) {
            const like_status = await this.postHandler.getPostLikeStatus(
                user,
                post.id
            );
            const save_status = await this.postHandler.getPostSaveStatus(
                user,
                post.id
            );

            profilePosts.push(
                toPostPage(post, baseUrl, like_status, save_status)
            );
        }
        return profilePosts;
    }

    public async followHandler(user: User, following_username: string) {
        const followStatus = await this.userRelationService.getFollowStatus(
            user,
            following_username
        );

        if (
            followStatus == "unfollowed" ||
            followStatus == "not followed" ||
            followStatus == "request rejected" ||
            followStatus == "request rescinded" ||
            followStatus == "follower deleted" ||
            followStatus == "unblocked"
        ) {
            return this.follow(user, following_username);
        } else {
            return this.unfollow(user, following_username);
        }
    }

    public async follow(user: User, following_username: string) {
        return this.userRelationService.follow(user, following_username);
    }

    public async unfollow(user: User, following_username: string) {
        return this.userRelationService.unfollow(user, following_username);
    }

    public async acceptFollowRequest(user: User, follower_username: string) {
        return this.userRelationService.acceptFollowRequest(
            user,
            follower_username
        );
    }

    public async rejectFollowRequest(user: User, follower_username: string) {
        return this.userRelationService.rejectFollowRequest(
            user,
            follower_username
        );
    }

    public async userProfile(
        session_user: User,
        username: string,
        baseUrl: string
    ) {
        const user = await this.userService.getUserByUsername(username);
        const followStatus = await this.getFollowStatus(session_user, username);
        const reverse_followStatus = await this.getFollowStatus(
            user,
            session_user.username
        );
        const profileFollowStatus = toProfileFollowStatus(
            followStatus,
            reverse_followStatus
        );

        if (
            profileFollowStatus.followStatus === "blocked" ||
            profileFollowStatus.reverseFollowStatus === "blocked" ||
            (user.profileStatus === "private" &&
                profileFollowStatus.followStatus !== "followed")
        ) {
            return toProfile(user, profileFollowStatus, [], baseUrl);
        }

        const posts = await this.getUserPosts(username, baseUrl);
        const normalPosts = posts.filter(
            (post) => post.close_status === "normal"
        );
        if (followStatus === "followed") {
            return toProfile(user, profileFollowStatus, normalPosts, baseUrl);
        } else if (followStatus === "close") {
            return toProfile(user, profileFollowStatus, posts, baseUrl);
        }
        return toProfile(user, profileFollowStatus, normalPosts, baseUrl);
    }

    public async followerList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followerList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async followeingList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followeingList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async allFollowingList(username: string) {
        return this.userRelationService.allFolloweingList(username);
    }

    public async savePostHandler(user: User, postId: string) {
        const savedStatus = await this.savedService.getPostSaveStatus(
            user,
            postId
        );
        if (savedStatus) {
            return this.unSavePost(user, postId);
        } else {
            return this.savePost(user, postId);
        }
    }

    public async savePost(user: User, postId: string) {
        return this.savedService.savePost(user, postId);
    }

    public async unSavePost(user: User, postId: string) {
        return this.savedService.unSavePost(user, postId);
    }

    public async getUserByUsername(username: string) {
        return this.userService.getUserByUsername(username);
    }

    public async deleteFollower(user: User, follower_username: string) {
        return this.userRelationService.deleteFollower(user, follower_username);
    }

    public async blockHandler(user: User, following_username: string) {
        const followStatus = await this.userRelationService.getFollowStatus(
            user,
            following_username
        );

        if (followStatus == "blocked") {
            return this.unblock(user, following_username);
        } else {
            return this.block(user, following_username);
        }
    }

    public async block(user: User, following_username: string) {
        return this.userRelationService.block(user, following_username);
    }

    public async unblock(user: User, following_username: string) {
        return this.userRelationService.unblock(user, following_username);
    }

    public async getUserNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        return await this.notificationService.getUserNotifications(
            user,
            baseUrl,
            page,
            limit
        );
    }

    public async getUserFollowingsNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        return await this.notificationService.getUserFollowingsNotifications(
            user,
            baseUrl,
            page,
            limit
        );
    }

    public async addCloseFriendHandler(user: User, follower_username: string) {
        const follower = await this.userService.getUserByUsername(
            follower_username
        );
        if (!follower) {
            throw new NotFoundError();
        }
        const followStatus = await this.userRelationService.getFollowStatus(
            follower,
            user.username
        );
        if (followStatus == "close") {
            return this.removeCloseFriend(user, follower_username);
        } else {
            return this.addCloseFriend(user, follower_username);
        }
    }

    public async addCloseFriend(user: User, follower_username: string) {
        return this.userRelationService.addCloseFriend(user, follower_username);
    }

    public async removeCloseFriend(user: User, follower_username: string) {
        return this.userRelationService.removeCloseFriend(
            user,
            follower_username
        );
    }

    public async closeFriendList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.closeFriendList(
            session_user,
            page,
            limit,
            baseUrl
        );
    }

    public async blockList(
        session_user: User,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.blockList(
            session_user,
            page,
            limit,
            baseUrl
        );
    }

    public async explore(
        user: User,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const followings = await this.userRelationService.allFolloweingList(
            user.username
        );
        const allPosts = await this.postHandler.getExplorePosts(
            followings,
            page,
            limit
        );

        const shownPosts = [];
        for (const post of allPosts.data) {
            if (post.close_status === "close") {
                const follow_status =
                    await this.userRelationService.getFollowStatus(
                        user,
                        post.user.username
                    );
                if (follow_status === "close") {
                    const like_status =
                        await this.postHandler.getPostLikeStatus(user, post.id);
                    const save_status =
                        await this.postHandler.getPostSaveStatus(user, post.id);

                    shownPosts.push(
                        toPostPage(post, baseUrl, like_status, save_status)
                    );
                }
            } else {
                const like_status = await this.postHandler.getPostLikeStatus(
                    user,
                    post.id
                );
                const save_status = await this.postHandler.getPostSaveStatus(
                    user,
                    post.id
                );

                shownPosts.push(
                    toPostPage(post, baseUrl, like_status, save_status)
                );
            }
        }

        const response = {
            data: shownPosts,
            meta: {
                page: page,
                limit: limit,
                total: shownPosts.length,
                totalPage: Math.ceil(shownPosts.length / limit),
            },
        };

        return response;
    }

    async getFollowStatus(user: User, following_username: string) {
        return this.userRelationService.getFollowStatus(
            user,
            following_username
        );
    }
}
