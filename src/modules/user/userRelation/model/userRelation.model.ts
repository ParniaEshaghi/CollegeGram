import { User } from "../../model/user.model";

export interface UserRelation {
    follower: User;
    following: User;
}

export type UserProfile = Omit<User, "password" | "email" | "profileStatus"> & {
    follow_status: boolean;
};

export const toProfile = (
    user: User,
    follow_status: boolean,
    baseUrl: string
): UserProfile => {
    const { password, profileStatus, email, profilePicture, ...profileInfo } =
        user;
    return {
        ...profileInfo,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        follow_status,
    };
};
