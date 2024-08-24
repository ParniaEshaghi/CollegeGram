import { Post } from "../../../postHandler/post/model/post.model";
import { User } from "../../userHandler/user/model/user.model";

export interface SavedPost {
    user: User;
    post: Post;
}
