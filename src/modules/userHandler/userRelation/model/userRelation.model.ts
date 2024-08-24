import {
    Post,
    PostWithUsername,
} from "../../../postHandler/post/model/post.model";
import { UserEntity } from "../../user/entity/user.entity";
import { User } from "../../user/model/user.model";

export interface UserRelation {
    follower: User;
    following: User;
}

export interface followerFollowing {
    data: UserEntity[];
    total: number;
}

export type UserProfile = Omit<User, "password" | "email" | "profileStatus"> & {
    follow_status: boolean;
    posts: PostWithUsername[];
};

export const toProfile = (
    user: User,
    follow_status: boolean,
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
        follow_status,
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
