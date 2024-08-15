import { User } from "../../user/model/user.model";

export interface Post {
    id: string;
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
}

export type PostWithUsername = Omit<Post, "user"> & {
    username: string;
};

export const toPostWithUsername = (
    post: Post,
    baseUrl: string
): PostWithUsername => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: user.username,
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
    };
};

export type ProfilePost = Omit<Post, "user" | "caption" | "tags" | "mentions">;

export const toProfilePost = (post: Post): ProfilePost => {
    const images = post.images;
    const id = post.id;
    return {
        id,
        images,
    };
};
