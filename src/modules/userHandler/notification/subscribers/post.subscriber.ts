import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CreateNotification, Notification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";
import { UserService } from "../../user/user.service";
import { User } from "../../user/model/user.model";
import { UserNotificationService } from "../userNotification/userNotification.service";
import { CreateUserNotification } from "../userNotification/model/userNotification.model";
import { UserRelationService } from "../../userRelation/userRelation.service";
import { NotificationEntity } from "../entity/notification.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<PostEntity> {
    constructor(
        private notificationService: NotificationService,
        private userService: UserService,
        private userNotificationsService: UserNotificationService,
        private userRelationService: UserRelationService
    ) {}

    listenTo() {
        return PostEntity;
    }

    async afterInsert(event: InsertEvent<PostEntity>): Promise<void> {
        const entity = event.entity;
        if ("mentions" in entity) {
            if (entity.mentions.length > 0) {
                const notificationRepo =
                    event.manager.getRepository(NotificationEntity);
                const userNotificationRepo = event.manager.getRepository(
                    UserNotificationEntity
                );

                entity.mentions.map(async (mention) => {
                    const notification = await this.tagsNotification(
                        event,
                        mention
                    );
                    if (notification) {
                        const notif = await notificationRepo.save(notification);
                        const userNotification =
                            await this.userNotificationsService.userNotif(
                                mention,
                                notif
                            );

                        if (userNotification) {
                            await userNotificationRepo.save(userNotification);
                        }

                        const senderFollowers =
                            await this.userNotificationsService.getSenderFollowers(
                                entity.user
                            );

                        senderFollowers.map(async (senderFollower) => {
                            const userNotification =
                                await this.userNotificationsService.userNotif(
                                    senderFollower.follower.username,
                                    notif
                                );
                            if (userNotification) {
                                await userNotificationRepo.save(
                                    userNotification
                                );
                            }
                        });
                    }
                });
            }
        }
    }

    async afterUpdate(event: UpdateEvent<PostEntity>): Promise<void> {
        const entity = event.entity as PostEntity;
        if ("mentions" in entity) {
            if (entity && entity.mentions.length > 0) {
                const notificationRepo =
                    event.manager.getRepository(NotificationEntity);
                const userNotificationRepo = event.manager.getRepository(
                    UserNotificationEntity
                );

                entity.mentions.map(async (mention: string) => {
                    const notification = await this.tagsUpdateNotification(
                        event,
                        mention
                    );
                    if (notification) {
                        const notif = await notificationRepo.save(notification);
                        const userNotification =
                            await this.userNotificationsService.userNotif(
                                mention,
                                notif
                            );
                        if (userNotification) {
                            await userNotificationRepo.save(userNotification);
                        }

                        const senderFollowers =
                            await this.userNotificationsService.getSenderFollowers(
                                entity.user
                            );

                        senderFollowers.map(async (senderFollower) => {
                            const userNotification =
                                await this.userNotificationsService.userNotif(
                                    senderFollower.follower.username,
                                    notif
                                );
                            if (userNotification) {
                                await userNotificationRepo.save(
                                    userNotification
                                );
                            }
                        });
                    }
                });
            }
        }
    }

    private async getUserByUsername(mention: string): Promise<User | null> {
        return await this.userService.getUserByUsername(mention);
    }

    private async tagsNotification(
        event: InsertEvent<PostEntity>,
        mention: string
    ) {
        const mentionedUser = await this.getUserByUsername(mention);
        if (mentionedUser) {
            const notification: CreateNotification = {
                recipient: mentionedUser,
                sender: event.entity.user,
                type: "tags",
                post: event.entity,
            };
            return notification;
        }
    }

    private async tagsUpdateNotification(
        event: UpdateEvent<PostEntity>,
        mention: string
    ): Promise<CreateNotification | undefined> {
        const entity = event.entity as PostEntity;
        if (event.entity) {
            const mentionedUser = await this.getUserByUsername(mention);
            if (mentionedUser) {
                const notification: CreateNotification = {
                    recipient: mentionedUser,
                    sender: event.entity.user,
                    type: "tags",
                    post: entity,
                };
                return notification;
            }
        }
        return undefined;
    }
}
