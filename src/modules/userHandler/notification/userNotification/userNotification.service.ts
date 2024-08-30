import { User } from "../../user/model/user.model";
import { UserService } from "../../user/user.service";
import { UserRelationService } from "../../userRelation/userRelation.service";
import { Notification } from "../model/notification.model";
import { CreateUserNotification } from "./model/userNotification.model";
import { UserNotificationRepository } from "./userNotification.repository";

export class UserNotificationService {
    constructor(
        private userNotificationRepo: UserNotificationRepository,
        private userService: UserService,
        private userRelationService: UserRelationService
    ) {}

    public createUserNotification(userNotification: CreateUserNotification) {
        return this.userNotificationRepo.create(userNotification);
    }

    public findByUserAndNotification(user: User, notification: Notification) {
        return this.userNotificationRepo.findByUserandNotification(
            user,
            notification
        );
    }

    public makeUserNotificationAsRead(
        userNotificationId: string,
        username: string
    ) {
        this.userNotificationRepo.makeUserNotificationAsRead(
            userNotificationId,
            username
        );
    }

    public async userNotif(
        username: string,
        notification: Notification
    ): Promise<CreateUserNotification | undefined> {
        const mentionedUser = await this.userService.getUserByUsername(
            username
        );
        if (mentionedUser && notification) {
            const userNotification: CreateUserNotification = {
                user: mentionedUser,
                notification: notification,
                isRead: false,
            };
            return userNotification;
        }
    }

    public async getSenderFollowers(user: User) {
        return this.userRelationService.allFolloweList(user);
    }
}
