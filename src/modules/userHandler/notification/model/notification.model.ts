import {
    Comment,
    CommentWithUsername,
    toCommentWithUsername,
} from "../../../postHandler/comment/model/comment.model";
import {
    Post,
    PostWithUsername,
    toPostWithUsername,
} from "../../../postHandler/post/model/post.model";
import { User } from "../../user/model/user.model";
import {
    FollowStatus,
    toUserList,
    UserList,
} from "../../userRelation/model/userRelation.model";
import { NotificationEntity } from "../entity/notification.entity";

export type NotificationTypes =
    | "tags"
    | "likePost"
    | "followAccept"
    | "followRequest"
    | "followed"
    | "followBackRequest"
    | "followBackAccept"
    | "comment";

export interface Notification {
    id: string;
    recipient: User;
    sender: User;
    type: NotificationTypes;
    post?: Post;
    comment?: Comment;
    isRead?: boolean;
}

export type CreateNotification = Omit<Notification, "id">;

export interface notificationData {
    data: NotificationEntity[];
    total: number;
}

export type userNotificationsResponse = {
    data: ShownNotification[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};

export type ShownNotification = {
    id: string;
    recipient: UserList;
    sender: UserList;
    type: NotificationTypes;
    post?: PostWithUsername;
    comment?: CommentWithUsername;
    isRead?: boolean;
};

export const toShownNotification = (
    notification: Notification,
    baseUrl: string
): ShownNotification => {
    const { recipient, sender, comment, post, ...commentDetails } =
        notification;
    return {
        ...commentDetails,
        id: notification.id,
        recipient: toUserList(recipient, baseUrl),
        sender: toUserList(sender, baseUrl),
        post: post ? toPostWithUsername(post, baseUrl) : undefined,
        comment: comment ? toCommentWithUsername(comment) : undefined,
    };
};

export type NotificationWithFollowStatus = Notification & {
    followStatus: FollowStatus;
};

export const toNotificationWithFollowStatus = (
    notification: NotificationEntity,
    followStatus: FollowStatus
): NotificationWithFollowStatus => {
    return { ...notification, followStatus };
};

export type userFollowingNotificationsResponse = {
    data: NotificationWithFollowStatus[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};
