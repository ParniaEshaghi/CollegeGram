import { CreateNotification, Notification, NotificationTypes } from "./model/notification.model";
import { NotificationRepository } from "./notification.repository";

export class NotificationService {
    constructor(private notificationRepo: NotificationRepository) {}

    public createNotification(notification: CreateNotification) {
        return this.notificationRepo.create(notification);
    }

    // for test
    public findByType(type: NotificationTypes): Promise<Notification[]> {
        return this.notificationRepo.findByType(type);
    }
}
