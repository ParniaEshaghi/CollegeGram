import { User } from "../../user/model/user.model";

export interface Post {
    id: string;
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
    like_count: number;
    comment_count: number;
    saved_count: number;
}

export type UpdatePost = Omit<
    Post,
    "like_count" | "comment_count" | "saved_count"
>;

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

export const toProfilePost = (
    username: string,
    post: Post,
    baseUrl: string
): PostWithUsername => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: username,
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
    };
};
