import { User } from "../../../userHandler/user/model/user.model";

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
    close_status: boolean;
}

export type UpdatePost = Omit<
    Post,
    "like_count" | "comment_count" | "saved_count"
>;

export type PostWithUsername = Omit<Post, "user"> & {
    username: string;
    profilePicture: string;
};

export type PostPage = PostWithUsername & {
    like_status: boolean;
    save_status: boolean;
};

export const toPostWithUsername = (
    post: Post,
    baseUrl: string
): PostWithUsername => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
    };
};

export const toPostPage = (
    post: Post,
    baseUrl: string,
    like_status: boolean,
    save_status: boolean
): PostPage => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
        like_status,
        save_status,
    };
};

export const toProfilePost = (
    post_user: User,
    post: Post,
    baseUrl: string
): PostWithUsername => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: post_user.username,
        profilePicture: post_user.profilePicture
            ? `${baseUrl}/api/images/profiles/${post_user.profilePicture}`
            : "",
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
    };
};
