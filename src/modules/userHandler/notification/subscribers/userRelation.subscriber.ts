import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

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
            const notif = await notificationRepo.save(
                this.followedNotification(event)
            );

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

            // ya khoda

            const oldNotification =
                await this.notificationService.getFollowedNotification(
                    event.entity.follower,
                    event.entity.following
                );

            if (oldNotification) {
                const notif = await notificationRepo.save(
                    this.followBackNotification(event)
                );

                await this.notificationService.deleteNotification(
                    oldNotification
                );

                const userNotification =
                    await this.userNotificationsService.userNotif(
                        event.entity.follower.username,
                        notif
                    );
                if (userNotification) {
                    await userNotificationRepo.save(userNotification);
                }

                const senderFollowers =
                    await this.userNotificationsService.getSenderFollowers(
                        event.entity.following
                    );

                for (const senderFollower of senderFollowers) {
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

        if (event.entity.followStatus == "request accepted") {
            const notification: CreateNotification = {
                recipient: event.entity.follower,
                sender: event.entity.following,
                type: "followAccept",
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

        //     if (event.entity.followStatus == "request pending") {
        //         const notification: CreateNotification = {
        //             recipient: event.entity.follower,
        //             sender: event.entity.following,
        //             type: "followRequest",
        //         };
        //         await notificationRepo.save(notification);
        //     }
    }

    followedNotification(event: InsertEvent<UserRelationEntity>) {
        const notification: CreateNotification = {
            recipient: event.entity.following,
            sender: event.entity.follower,
            type: "followed",
        };
        return notification;
    }

    followBackNotification(event: InsertEvent<UserRelationEntity>) {
        const notification: CreateNotification = {
            recipient: event.entity.follower,
            sender: event.entity.following,
            type: "followBack",
        };
        return notification;
    }
}
