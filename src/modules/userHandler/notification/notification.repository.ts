import { DataSource, Repository } from "typeorm";
import { NotificationEntity } from "./entity/notification.entity";
import {
    CreateNotification,
    Notification,
    NotificationTypes,
} from "./model/notification.model";

export class NotificationRepository {
    private notificationRepo: Repository<NotificationEntity>;
    constructor(private appDataSource: DataSource) {
        this.notificationRepo = appDataSource.getRepository(NotificationEntity);
    }

    public create(notification: CreateNotification): Promise<Notification> {
        return this.notificationRepo.save(notification);
    }

    // for test
    public findByType(type: NotificationTypes) {
        return this.notificationRepo.find({
            where: { type: "likePost" },
            relations: ["recipient", "sender", "post"],
        });
    }
}
