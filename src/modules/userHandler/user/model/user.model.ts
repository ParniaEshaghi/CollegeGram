import {
    Post,
    PostWithUsername,
} from "../../../postHandler/post/model/post.model";

export interface User {
    username: string;
    password: string;
    email: string;
    profilePicture: string;
    firstname: string;
    lastname: string;
    profileStatus: "public" | "private";
    bio: string;
}

export interface CreateUser {
    username: string;
    password: string;
    email: string;
}

export interface UpdateProfile {
    password?: string;
    email: string;
    firstname: string;
    lastname: string;
    profileStatus: "public" | "private";
    bio: string;
}

export type UserWithoutPassword = Omit<User, "password">;

export const toUserWithoutPassword = (user: User): UserWithoutPassword => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export type ProfileInfo = Omit<User, "password"> & {
    follower_count: number;
    following_count: number;
    post_count: number;
    posts: any[];
    unreadNotifications: number;
};

export const toProfileInfo = (
    user: User,
    posts: PostWithUsername[],
    baseUrl: string,
    unreadNotifications: number,
    follower_count: number,
    following_count: number,
    post_count: number
): ProfileInfo => {
    const { password, profilePicture, ...profileInfo } = user;
    return {
        ...profileInfo,
        posts,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        unreadNotifications: unreadNotifications,
        follower_count,
        following_count,
        post_count,
    };
};

export type EditProfileInfo = Omit<
    User,
    | "username"
    | "password"
    | "follower_count"
    | "following_count"
    | "post_count"
>;

export const toEditProfileInfo = (
    user: User,
    baseUrl: string
): EditProfileInfo => {
    const { username, password, profilePicture, ...editProfileInfo } = user;
    return {
        ...editProfileInfo,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
    };
};
