import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";
import { UserNotificationService } from "../userNotification/userNotification.service";

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
        if (
            event.entity.followStatus === "request accepted" ||
            event.entity.followStatus === "followed"
        ) {
            const notif = await this.notificationService.createNotification(
                this.followedNotification(event)
            );

            const userNotification =
                await this.userNotificationsService.userNotif(
                    event.entity.following.username,
                    notif
                );
            if (userNotification) {
                this.userNotificationsService.createUserNotification(
                    userNotification
                );
            }

            const senderFollowers =
                await this.userNotificationsService.getSenderFollowers(
                    event.entity.follower
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

        if (event.entity.followStatus === "request pending") {
            const notification: CreateNotification = {
                recipient: event.entity.following,
                sender: event.entity.follower,
                type: "followRequest",
            };

            const notif = await this.notificationService.createNotification(
                notification
            );

            const userNotification =
                await this.userNotificationsService.userNotif(
                    event.entity.following.username,
                    notif
                );
            if (userNotification) {
                this.userNotificationsService.createUserNotification(
                    userNotification
                );
            }

            // ya khoda

            const oldNotification =
                await this.notificationService.getFollowedNotification(
                    event.entity.follower,
                    event.entity.following
                );

            if (oldNotification) {
                const notif = await this.notificationService.createNotification(
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
                    this.userNotificationsService.createUserNotification(
                        userNotification
                    );
                }

                const senderFollowers =
                    await this.userNotificationsService.getSenderFollowers(
                        event.entity.following
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

        if (event.entity.followStatus == "request accepted") {
            const notification: CreateNotification = {
                recipient: event.entity.follower,
                sender: event.entity.following,
                type: "followAccept",
            };
            const notif = await this.notificationService.createNotification(
                notification
            );

            const userNotification =
                await this.userNotificationsService.userNotif(
                    event.entity.follower.username,
                    notif
                );
            if (userNotification) {
                this.userNotificationsService.createUserNotification(
                    userNotification
                );
            }
        }

        //     if (event.entity.followStatus == "request pending") {
        //         const notification: CreateNotification = {
        //             recipient: event.entity.follower,
        //             sender: event.entity.following,
        //             type: "followRequest",
        //         };
        //         await this.notificationService.createNotification(notification);
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
