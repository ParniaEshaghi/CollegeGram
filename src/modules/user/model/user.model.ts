import { Post, ProfilePost } from "../../post/model/post.model";

export interface User {
    username: string;
    password: string;
    email: string;
    profilePicture: string;
    firstname: string;
    lastname: string;
    profileStatus: "public" | "private";
    bio: string;
    follower_count: number;
    following_count: number;
    post_count: number;
}

export type UserWithoutPassword = Omit<User, "password">;

export const toUserWithoutPassword = (user: User): UserWithoutPassword => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export type ProfileInfo = Omit<User, "password" | "email" | "profileStatus"> & {
    posts: any[];
};

export const toProfileInfo = (
    user: User,
    posts: ProfilePost[],
    baseUrl: string
): ProfileInfo => {
    const { password, profileStatus, email, profilePicture, ...profileInfo } =
        user;
    return {
        ...profileInfo,
        posts,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
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
    const {
        username,
        password,
        follower_count,
        following_count,
        post_count,
        profilePicture,
        ...editProfileInfo
    } = user;
    return {
        ...editProfileInfo,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
    };
};
