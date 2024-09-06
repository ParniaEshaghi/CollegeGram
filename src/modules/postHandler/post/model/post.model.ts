import { User } from "../../../userHandler/user/model/user.model";

export interface Post {
    id: string;
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
    close_status: "close" | "normal";
}

export type CreatePost = Omit<Post, "id">;

export type UpdatePost = Post;

export type PostWithUsername = Omit<Post, "user"> & {
    username: string;
    firstname: string;
    lastname: string;
    profilePicture: string;
};

export type PostPage = PostWithUsername & {
    follower_count: number;
    like_status: boolean;
    save_status: boolean;
    like_count: number;
    saved_count: number;
    comment_count: number;
};

export const toPostWithUsername = (
    post: Post,
    baseUrl: string
): PostWithUsername => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
    };
};

export const toPostPage = (
    post_user: User,
    post: Post,
    baseUrl: string,
    follower_count: number,
    like_status: boolean,
    save_status: boolean,
    like_count: number,
    saved_count: number,
    comment_count: number
): PostPage => {
    const { user, images, ...postDetails } = post;
    return {
        ...postDetails,
        username: post_user.username,
        firstname: post_user.firstname,
        lastname: post_user.lastname,
        follower_count,
        profilePicture: post_user.profilePicture
            ? `${baseUrl}/api/images/profiles/${post_user.profilePicture}`
            : "",
        images: post.images.map(
            (image) => `${baseUrl}/api/images/posts/${image}`
        ),
        like_status,
        save_status,
        like_count,
        saved_count,
        comment_count,
    };
};
