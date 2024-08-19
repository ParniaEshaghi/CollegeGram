import { User } from "../../../user/model/user.model";
import { Post } from "../../model/post.model";

export interface Comment {
    post: Post;
    user: User;
    text: string;
    like_count: number;
    parent?: Comment;
}

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
