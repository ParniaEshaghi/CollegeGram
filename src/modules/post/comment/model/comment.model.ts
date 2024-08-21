import { User } from "../../../user/model/user.model";
import { Post } from "../../model/post.model";

export interface Comment {
    id: string;
    post: Post;
    user: User;
    text: string;
    like_count: number;
    parent?: Comment;
}

export interface CommentsList {
    data: Comment[];
    total: number;
}

export type PostCommentList = Omit<Comment, "post" | "user"> & {
    username: string;
    profilePicture: string;
    firstname: string;
    lastname: string;
};

export const toPostCommentList = (
    comment: Comment,
    baseUrl: string
): PostCommentList => {
    const { user, post, ...commentDetails } = comment;
    return {
        ...commentDetails,
        username: user.username,
        profilePicture: user.profilePicture
            ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
            : "",
        firstname: user.firstname,
        lastname: user.lastname,
    };
};

export type CreateComment = Omit<Comment, "id">;

export type CommentWithUsername = Omit<Comment, "post" | "user"> & {
    username: string;
};

export const toCommentWithUsername = (
    comment: Comment
): CommentWithUsername => {
    const { user, post, ...commentDetails } = comment;
    return {
        ...commentDetails,
        username: user.username,
    };
};
