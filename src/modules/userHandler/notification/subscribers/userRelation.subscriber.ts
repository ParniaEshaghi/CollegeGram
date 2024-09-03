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
        private userNotificationsService: UserNotificationService,
        private userRelationService: UserRelationService
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
            }

            const notif = await notificationRepo.save(
                await this.followedNotification(event)
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

        if (event.entity.followStatus === "request rejected") {
            await notificationRepo.softDelete({
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followRequest",
            });

            const oldNotification =
                await this.notificationService.getNotification(
                    event.entity.follower,
                    event.entity.following,
                    "followBackRequest"
                );

            if (oldNotification) {
                await notificationRepo.save({
                    id: oldNotification.id,
                    type: "followed",
                });
            }
        }

        if (event.entity.followStatus === "request rescinded") {
            const oldNotification =
                await this.notificationService.getNotification(
                    event.entity.follower,
                    event.entity.following,
                    "followBackRequest"
                );

            if (oldNotification) {
                await notificationRepo.save({
                    id: oldNotification.id,
                    type: "followed",
                });
            }

            await notificationRepo.softDelete({
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followRequest",
            });
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
                await this.notificationService.getNotification(
                    event.entity.follower,
                    event.entity.following,
                    "followed"
                );

            if (oldNotification) {
                await notificationRepo.save({
                    id: oldNotification.id,
                    type: "followBackRequest",
                });
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

            const oldNotification =
                await this.notificationService.getNotification(
                    event.entity.follower,
                    event.entity.following,
                    "followBackRequest"
                );

            if (oldNotification) {
                await notificationRepo.save({
                    id: oldNotification.id,
                    type: "followBackAccept",
                });
            }
        }
    }

    async followedNotification(event: InsertEvent<UserRelationEntity>) {
        const followStatus = await this.userRelationService.getFollowStatus(
            event.entity.following,
            event.entity.follower.username
        );
        let type: NotificationTypes;
        if (
            followStatus === "close" ||
            followStatus === "followed" ||
            followStatus === "request accepted"
        ) {
            type = "followBackAccept";
        } else if (followStatus === "request pending") {
            type = "followBackRequest";
        } else {
            type = "followed";
        }
        const notification: CreateNotification = {
            recipient: event.entity.following,
            sender: event.entity.follower,
            type: type,
        };
        return notification;
    }

    async followBackNotification(event: InsertEvent<UserRelationEntity>) {
        const followStatus = await this.userRelationService.getFollowStatus(
            event.entity.following,
            event.entity.follower.username
        );
        let type: NotificationTypes;

        if (followStatus === "request pending") {
            type = "followBackRequest";
        } else {
            type = "followed";
        }
        const notification: CreateNotification = {
            recipient: event.entity.following,
            sender: event.entity.follower,
            type: type,
        };
        return notification;
    }
}
