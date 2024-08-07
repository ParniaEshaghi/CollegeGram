export interface User {
    username: string;
    password: string;
    email: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    profileStatus: "public" | "private";
    bio: string;
    follower_count: number;
    following_count: number;
    post_count: number;
}
