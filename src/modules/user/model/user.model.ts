export interface User {
    username: string;
    password: string;
    email: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    profileStatus: "public" | "private";
    bio: string;
    tokens: string[];
}
