import { DataSource, Repository } from "typeorm";
import { NotificationEntity } from "./entity/notification.entity";
import {
    CreateNotification,
    Notification,
    NotificationTypes,
} from "./model/notification.model";
import { User } from "../user/model/user.model";

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
}
