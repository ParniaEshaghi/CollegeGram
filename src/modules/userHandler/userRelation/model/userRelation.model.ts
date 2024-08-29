import {
    Post,
    PostWithUsername,
} from "../../../postHandler/post/model/post.model";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";

export type FollowStatus =
    | "request pending"
    | "followed"
    | "unfollowed"
    | "request accepted"
    | "request rejected"
    | "close"
    | "blocked"
    | "unblocked"
    | "request rescinded"
    | "not followed"
    | "follower deleted";

export interface UserRelation {
    follower: User;
    following: User;
    followStatus: FollowStatus;
}

export interface followerFollowing {
    data: UserEntity[];
    total: number;
}

export type UserProfile = Omit<User, "password" | "email" | "profileStatus"> & {
    followStatus: ProfileFollowStatus;
    posts: PostWithUsername[];
};

export type ProfileFollowStatus =
    | "followed"
    | "requested"
    | "not followed"
    | "blocked";

export const toProfileFollowStatus = (
    followStatus: FollowStatus
): ProfileFollowStatus => {
    if (
        followStatus === "not followed" ||
        followStatus === "unfollowed" ||
        followStatus === "request rejected" ||
        followStatus === "request rescinded" ||
        followStatus === "follower deleted"
    ) {
        return "not followed";
    }
    if (
        followStatus === "followed" ||
        followStatus === "request accepted" ||
        followStatus === "close"
    ) {
        return "followed";
    }
    if (followStatus === "request pending") {
        return "requested";
    }
    if (followStatus === "blocked") {
        return "blocked";
    }
    return "not followed";
};

export const toProfile = (
    user: User,
    followStatus: ProfileFollowStatus,
    posts: PostWithUsername[],
    baseUrl: string
): UserProfile => {
    const { password, profileStatus, email, profilePicture, ...profileInfo } =
        user;
    return {
        ...profileInfo,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        posts,
        followStatus,
    };
};

export type followerFollowingListUser = Omit<
    User,
    "password" | "post_count" | "email" | "profileStatus" | "bio"
>;

export const toFollowerFollowingListUser = (
    user: User,
    baseUrl: string
): followerFollowingListUser => {
    return {
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        firstname: user.firstname,
        lastname: user.lastname,
        follower_count: user.follower_count,
        following_count: user.following_count,
    };
};

export type followerFollowingListUserResponse = {
    data: followerFollowingListUser[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};
