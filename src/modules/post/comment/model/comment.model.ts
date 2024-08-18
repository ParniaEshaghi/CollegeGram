import { User } from "../../../user/model/user.model";
import { Post } from "../../model/post.model";

export interface Comment {
    post: Post;
    user: User;
    text: string;
    like_count: number;
}
