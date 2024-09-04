import { Comment } from "../../../postHandler/comment/model/comment.model";
import { Post } from "../../../postHandler/post/model/post.model";
import { User } from "../../user/model/user.model";
import { FollowStatus } from "../../userRelation/model/userRelation.model";
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
    data: Notification[];
    meta: {
        total: number;
        page: number;
        totalPage: number;
        limit: number;
    };
};

// export const toUserNotificationsResponse = (data: Notification[], total: number,
//     page: number,
//     totalPage: number,
//     limit: number) : userNotificationsResponse=> {
//         return {
//             data: data,
//             tot
//         }
//     }

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
