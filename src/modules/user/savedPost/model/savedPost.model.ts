import { Post } from "../../../post/model/post.model";
import { User } from "../../model/user.model";

export interface SavedPost {
    user: User;
    post: Post;
}
