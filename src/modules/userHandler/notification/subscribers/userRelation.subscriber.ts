import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import {
    CreateNotification,
    NotificationTypes,
} from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";
import { UserRelationService } from "../../userRelation/userRelation.service";

@EventSubscriber()
export class UserRelationSubscriber
    implements EntitySubscriberInterface<UserRelationEntity>
{
    constructor(
        private notificationService: NotificationService,
        private userNotificationsService: UserNotificationService
    ) {}

    listenTo() {
        return UserRelationEntity;
    }

    async afterInsert(event: InsertEvent<UserRelationEntity>): Promise<void> {
        const notificationRepo =
            event.manager.getRepository(NotificationEntity);
        const userNotificationRepo = event.manager.getRepository(
            UserNotificationEntity
        );

        if (
            event.entity.followStatus === "request accepted" ||
            event.entity.followStatus === "followed"
        ) {
            if (event.entity.followStatus === "request accepted") {
                await notificationRepo.softDelete({
                    recipient: event.entity.following,
                    sender: event.entity.follower,
                    type: "followRequest",
                });
                const notification: CreateNotification = {
                    recipient: event.entity.follower,
                    sender: event.entity.following,
                    type: "requestAccepted",
                };
                const notif = await notificationRepo.save(notification);

                const userNotification =
                    await this.userNotificationsService.userNotif(
                        event.entity.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }
            }
            const notification: CreateNotification = {
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followed",
            };
            const notif = await notificationRepo.save(notification);

            const userNotification =
                await this.userNotificationsService.userNotif(
                    event.entity.following.username,
                    notif
                );
            if (userNotification) {
                await userNotificationRepo.save(userNotification);
            }

            const senderFollowers =
                await this.userNotificationsService.getSenderFollowers(
                    event.entity.follower
                );

            for (const senderFollower of senderFollowers) {
                if (senderFollower.follower.id != event.entity.following.id) {
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

        if (event.entity.followStatus === "request pending") {
            const notification: CreateNotification = {
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followRequest",
            };
            const notif = await notificationRepo.save(notification);

            const userNotification =
                await this.userNotificationsService.userNotif(
                    event.entity.following.username,
                    notif
                );
            if (userNotification) {
                await userNotificationRepo.save(userNotification);
            }
        }

        if (
            event.entity.followStatus == "request rejected" ||
            event.entity.followStatus == "request rescinded"
        ) {
            await notificationRepo.softDelete({
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followRequest",
            });
        }
    }
}
