import { User } from "../../user/model/user.model";

export interface Post {
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
}

export type PostWithoutUser = Omit<Post, "user">;

export type PostWithoutUserWithId = Omit<Post, "user"> & {
    id: string;
};
