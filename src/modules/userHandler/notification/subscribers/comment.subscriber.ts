import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";

@EventSubscriber()
export class CommentSubscriber
    implements EntitySubscriberInterface<CommentEntity>
{
    constructor(
        private notificationService: NotificationService,
        private userNotificationsService: UserNotificationService
    ) {}

    listenTo() {
        return CommentEntity;
    }

    async afterInsert(event: InsertEvent<CommentEntity>): Promise<void> {
        if (event.entity.parent) {
            return;
        }
        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "comment",
            post: event.entity.post,
            comment: event.entity,
        };
        const notif = await this.notificationService.createNotification(
            notification
        );

        const userNotification = await this.userNotificationsService.userNotif(
            event.entity.post.user.username,
            notif
        );
        if (userNotification) {
            this.userNotificationsService.createUserNotification(
                userNotification
            );
        }

        const senderFollowers =
            await this.userNotificationsService.getSenderFollowers(
                event.entity.user
            );

        senderFollowers.map(async (senderFollower) => {
            const userNotification =
                await this.userNotificationsService.userNotif(
                    senderFollower.follower.username,
                    notif
                );
            if (userNotification) {
                this.userNotificationsService.createUserNotification(
                    userNotification
                );
            }
        });
    }
}
