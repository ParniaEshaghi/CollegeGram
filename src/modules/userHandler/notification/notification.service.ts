import { UnauthorizedError } from "../../../utility/http-errors";
import { User } from "../user/model/user.model";

import {
    CreateNotification,
    Notification,
    NotificationTypes,
    toShownNotification,
    toNotificationWithFollowStatus,
    userNotificationsResponse,
} from "./model/notification.model";
import { NotificationRepository } from "./notification.repository";
import { UserRelationService } from "../userRelation/userRelation.service";
import { NotificationEntity } from "./entity/notification.entity";
import { UserRelationEntity } from "../userRelation/entity/userRelation.entity";
import { UserNotificationService } from "./userNotification/userNotification.service";
import { toFollowerFollowingListUser } from "../userRelation/model/userRelation.model";
import { toProfileFollowStatus } from "../userRelation/model/userRelation.model";

export class NotificationService {
    constructor(
        private notificationRepo: NotificationRepository,
        private userRelationService: UserRelationService,
        private userNotificationsService: UserNotificationService
    ) {}

    public async createNotification(notification: CreateNotification) {
        return await this.notificationRepo.create(notification);
    }

    // for test
    public findByType(type: NotificationTypes): Promise<Notification[]> {
        return this.notificationRepo.findByType(type);
    }

    public getNotification(
        recipient: User,
        sender: User,
        type: NotificationTypes
    ) {
        return this.notificationRepo.getNotification(recipient, sender, type);
    }

    public deleteNotification(notification: Notification) {
        return this.notificationRepo.delete(notification);
    }

    private markNotificationAsRead(userNotifId: string, username: string) {
        this.userNotificationsService.makeUserNotificationAsRead(
            userNotifId,
            username
        );
    }

    private async getUserNotif(user: User, page: number, limit: number) {
        return await this.notificationRepo.getUserNotifications(
            user,
            page,
            limit
        );
    }

    private async getUserFollowingsNotif(
        userFollowings: UserRelationEntity[],
        page: number,
        limit: number
    ) {
        return await this.notificationRepo.getUserFollowingsNotifications(
            userFollowings,
            page,
            limit
        );
    }

    private filterFollowingnotif(
        userFollowings: UserRelationEntity[],
        userNotifs: NotificationEntity[]
    ): NotificationEntity[] {
        const filteredData: NotificationEntity[] = [];

        userFollowings.forEach((userFollowing) => {
            userNotifs.forEach((userNotif) => {
                if (userFollowing.following.id == userNotif.sender.id) {
                    if (userFollowing.createdAt < userNotif.createdAt) {
                        filteredData.push(userNotif);
                    }
                }
            });
        });

        return filteredData;
    }

    public async getUserNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const userNotifs = await this.getUserNotif(user, page, limit);

        const userNotifications = [];

        for (const data of userNotifs.data) {
            const notif =
                await this.userNotificationsService.findByUserAndNotification(
                    data.recipient,
                    data
                );

            if (notif) {
                data.isRead = notif.isRead;
                const followStatus =
                    await this.userRelationService.getFollowStatus(
                        data.recipient,
                        data.sender.username
                    );
                const reverse_followStatus =
                    await this.userRelationService.getFollowStatus(
                        data.sender,
                        data.recipient.username
                    );

                const profileFollowStatus = toProfileFollowStatus(
                    followStatus,
                    reverse_followStatus
                );

                userNotifications.push(
                    toNotificationWithFollowStatus(data, profileFollowStatus)
                );

                await this.markNotificationAsRead(notif.id, user.username);
            }
        }

        const response: userNotificationsResponse = {
            data: userNotifications.map((notif) =>
                toShownNotification(notif, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: userNotifs.total,
                totalPage: Math.ceil(userNotifs.total / limit),
            },
        };

        return response;
    }

    public async getUserFollowingsNotifications(
        user: User,
        baseUrl: string,
        page: number,
        limit: number
    ) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const userFollowings = await this.userRelationService.allFolloweingList(
            user.username
        );
        const userNotifs = await this.getUserFollowingsNotif(
            userFollowings,
            page,
            limit
        );

        const filteredData = this.filterFollowingnotif(
            userFollowings,
            userNotifs.data
        );

        const filteredDataFromSelf = filteredData.filter(
            (fData) =>
                fData.recipient.username != user.username &&
                (fData.type === "comment" ||
                    fData.type === "followAccept" ||
                    fData.type === "followBackAccept" ||
                    fData.type === "followBackRequest" ||
                    fData.type === "followed" ||
                    fData.type === "likePost")
        );

        const userFollowingNotifications = [];

        for (const fData of filteredDataFromSelf) {
            const notif =
                await this.userNotificationsService.findByUserAndNotification(
                    user,
                    fData
                );

            if (notif) {
                const followStatus =
                    await this.userRelationService.getFollowStatus(
                        user,
                        fData.recipient.username
                    );
                const reverse_followStatus =
                    await this.userRelationService.getFollowStatus(
                        fData.recipient,
                        user.username
                    );

                const profileFollowStatus = toProfileFollowStatus(
                    followStatus,
                    reverse_followStatus
                );

                userFollowingNotifications.push(
                    toNotificationWithFollowStatus(fData, profileFollowStatus)
                );

                await this.markNotificationAsRead(notif.id, user.username);
            }
        }

        const response: userNotificationsResponse = {
            data: userFollowingNotifications.map((notif) =>
                toShownNotification(notif, baseUrl)
            ),
            meta: {
                page: page,
                limit: limit,
                total: userNotifs.total,
                totalPage: Math.ceil(userNotifs.total / limit),
            },
        };

        return response;
    }

    public async getAllUserUnreadNotifications(user: User): Promise<number> {
        if (!user) {
            throw new UnauthorizedError();
        }

        let totalUserUnreadNotifications = 0;

        const userAllNotifs = await this.notificationRepo.getUserAllNotifs(
            user
        );

        for (const userNotif of userAllNotifs) {
            const notif =
                await this.userNotificationsService.findByUserAndNotification(
                    userNotif.recipient,
                    userNotif
                );

            if (notif) {
                if (notif.isRead == false) {
                    totalUserUnreadNotifications += 1;
                }
            }
        }

        return totalUserUnreadNotifications;
    }

    public async getAllUserFollowingsUnreadNotifications(
        user: User
    ): Promise<number> {
        if (!user) {
            throw new UnauthorizedError();
        }

        let totalUserFollowingsUnreadNotifications = 0;

        const userFollowings = await this.userRelationService.allFolloweingList(
            user.username
        );
        const userNotifs =
            await this.notificationRepo.getAllUserFollowingsNotifs(
                userFollowings
            );

        const filteredData = this.filterFollowingnotif(
            userFollowings,
            userNotifs
        );

        for (const fData of filteredData) {
            if (fData.recipient.username != user.username) {
                const notif =
                    await this.userNotificationsService.findByUserAndNotification(
                        user,
                        fData
                    );

                if (notif) {
                    if (
                        notif.isRead == false &&
                        (notif.notification.type === "comment" ||
                            notif.notification.type === "followAccept" ||
                            notif.notification.type === "followBackAccept" ||
                            notif.notification.type === "followBackRequest" ||
                            notif.notification.type === "followed" ||
                            notif.notification.type === "likePost")
                    ) {
                        totalUserFollowingsUnreadNotifications += 1;
                    }
                }
            }
        }

        return totalUserFollowingsUnreadNotifications;
    }
}
