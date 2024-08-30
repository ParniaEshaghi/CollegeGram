import { DataSource, In, Repository } from "typeorm";
import { NotificationEntity } from "./entity/notification.entity";
import {
    CreateNotification,
    Notification,
    notificationData,
    NotificationTypes,
} from "./model/notification.model";
import { User } from "../user/model/user.model";
import { UserRelationEntity } from "../userRelation/entity/userRelation.entity";

export class NotificationRepository {
    private notificationRepo: Repository<NotificationEntity>;
    constructor(private appDataSource: DataSource) {
        this.notificationRepo = appDataSource.getRepository(NotificationEntity);
    }

    public create(notification: CreateNotification): Promise<Notification> {
        return this.notificationRepo.save(notification);
    }

    public async delete(notification: Notification): Promise<void> {
        await this.notificationRepo.softDelete(notification.id);
    }

    // for test
    public findByType(type: NotificationTypes) {
        return this.notificationRepo.find({
            where: { type },
            relations: ["recipient", "sender", "post", "comment"],
        });
    }

    public getFollowedNotification(recipient: User, sender: User) {
        return this.notificationRepo.findOne({
            where: {
                recipient: { username: recipient.username },
                sender: { username: sender.username },
                type: "followed",
            },
            relations: ["recipient", "sender", "post", "comment"],
        });
    }

    public async getUserNotifications(
        user: User,
        page: number,
        limit: number
    ): Promise<notificationData> {
        const [response, total] = await this.notificationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { recipient: { username: user.username } },
            relations: ["recipient", "sender", "post", "comment"],
            order: {
                createdAt: "DESC",
            },
        });

        return { data: response, total: total };
    }

    public async getUserFollowingsNotifications(
        followings: UserRelationEntity[],
        page: number,
        limit: number
    ): Promise<notificationData> {
        const [response, total] = await this.notificationRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                sender: {
                    id: In(
                        followings.map((following) => following.following.id)
                    ),
                },
            },
            relations: ["recipient", "sender", "post", "comment"],
        });

        return { data: response, total: total };
    }

    public async markNotificationsAsRead(
        notification: Notification
    ): Promise<void> {
        await this.notificationRepo.update(
            { id: notification.id },
            { isRead: true }
        );
    }
}
