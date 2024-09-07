import { DataSource, Repository } from "typeorm";
import { UserNotificationEntity } from "./entity/userNotification.entity";
import {
    CreateUserNotification,
    UserNotification,
} from "./model/userNotification.model";
import { User } from "../../user/model/user.model";
import { Notification } from "../model/notification.model";

export class UserNotificationRepository {
    private userNotificationRepo: Repository<UserNotificationEntity>;
    constructor(private appDataSource: DataSource) {
        this.userNotificationRepo = this.appDataSource.getRepository(
            UserNotificationEntity
        );
    }

    public async create(
        userNotification: CreateUserNotification
    ): Promise<UserNotification> {
        return await this.userNotificationRepo.save(userNotification);
    }

    public findByUserandNotification(user: User, notification: Notification) {
        return this.userNotificationRepo.findOne({
            where: {
                user: { username: user.username },
                notification: { id: notification.id },
            },
            relations: ["user", "notification"],
        });
    }

    public async makeUserNotificationAsRead(
        userNotificationId: string,
        username: string
    ) {
        // this.userNotificationRepo.update(
        //     { id: userNotificationId, user: { username: username } },

        //     { isRead: true },

        // );

        const userNotification = await this.userNotificationRepo.findOne({
            where: { id: userNotificationId, user: { username: username } },
            relations: ["user", "notification"],
        });

        if (userNotification) {
            // Update the notification if it exists
            await this.userNotificationRepo.update(
                { id: userNotificationId },
                { isRead: true }
            );
        }
    }

    public async checkExistance(
        user: User,
        notification: Notification
    ): Promise<UserNotification | null> {
        const response = await this.userNotificationRepo.findOne({
            where: {
                user: { username: user.username },
                notification: { id: notification.id },
            },
        });

        return response;
    }
}
