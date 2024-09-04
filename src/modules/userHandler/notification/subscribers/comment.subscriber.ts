import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

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
        const notificationRepo =
            event.manager.getRepository(NotificationEntity);
        const userNotificationRepo = event.manager.getRepository(
            UserNotificationEntity
        );

        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "comment",
            post: event.entity.post,
            comment: event.entity,
        };
        const notif = await notificationRepo.save(notification);

        const userNotification = await this.userNotificationsService.userNotif(
            event.entity.post.user.username,
            notif
        );
        if (userNotification) {
            await userNotificationRepo.save(userNotification);
        }

        const senderFollowers =
            await this.userNotificationsService.getSenderFollowers(
                event.entity.user
            );

        for (const senderFollower of senderFollowers) {
            if (senderFollower.follower.id != event.entity.post.id) {
                const userNotification =
                    await this.userNotificationsService.userNotif(
                        senderFollower.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }
            }
        }
    }
}
