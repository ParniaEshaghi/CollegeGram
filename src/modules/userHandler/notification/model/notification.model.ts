import { Comment } from "../../../postHandler/comment/model/comment.model";
import { Post } from "../../../postHandler/post/model/post.model";
import { User } from "../../user/model/user.model";

type NotificationTypes =
    | "tags"
    | "likePost"
    | "followAccept"
    | "followRequest"
    | "followed"
    | "followBack"
    | "comment";

export interface Notification {
    id: string;
    recipient: User;
    sender: User;
    type: NotificationTypes;
    post: Post;
    comment: Comment;
    isRead: boolean;
}

export type CreateNotification = Omit<Notification, "id">;
