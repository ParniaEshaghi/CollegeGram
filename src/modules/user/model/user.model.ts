export interface User {
    username: string;
    password: string;
    email: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    profileStatus: "public" | "private";
    follower_count: number;
    following_count: number;
    posts_count: number;
    bio: string;
    follower_count: number;
    following_count: number;
    post_count: number;
    tokens: string[];
}
