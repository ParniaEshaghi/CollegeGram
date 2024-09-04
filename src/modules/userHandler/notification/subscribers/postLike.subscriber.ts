import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

@EventSubscriber()
export class PostLikeSubscriber
    implements EntitySubscriberInterface<PostLikeEntity>
{
    constructor(
        private notificationService: NotificationService,
        private userNotificationsService: UserNotificationService
    ) {}

    listenTo() {
        return PostLikeEntity;
    }

    async afterInsert(event: InsertEvent<PostLikeEntity>): Promise<void> {
        const notificationRepo =
            event.manager.getRepository(NotificationEntity);
        const userNotificationRepo = event.manager.getRepository(
            UserNotificationEntity
        );

        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "likePost",
            post: event.entity.post,
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
            if (senderFollower.follower.id != event.entity.post.user.id) {
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
