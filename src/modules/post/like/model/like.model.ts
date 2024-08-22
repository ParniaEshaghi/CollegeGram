import { User } from "../../../user/model/user.model";
import { Comment } from "../../comment/model/comment.model";
import { Post } from "../../model/post.model";

export interface PostLike {
    post: Post;
    user: User;
}

export interface CommentLike {
    comment: Comment;
    user: User;
}
