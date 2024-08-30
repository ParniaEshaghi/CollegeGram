import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserNotificationService } from "../userNotification/userNotification.service";

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
        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "likePost",
            post: event.entity.post,
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
