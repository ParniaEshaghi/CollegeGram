import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { UserRelationEntity } from "../../userRelation/entity/userRelation.entity";

@EventSubscriber()
export class UserRelationSubscriber
    implements EntitySubscriberInterface<UserRelationEntity>
{
    constructor(private notificationService: NotificationService) {}

    listenTo() {
        return UserRelationEntity;
    }

    async afterInsert(event: InsertEvent<UserRelationEntity>): Promise<void> {
        if (event.entity.followStatus === "request accepted" || "followed") {
            await this.notificationService.createNotification(
                this.followedNotification(event)
            );
        }
        if (event.entity.followStatus === "request pending") {
            const oldNotification =
                await this.notificationService.getFollowedNotification(
                    event.entity.follower,
                    event.entity.following
                );
            if (oldNotification) {
                await this.notificationService.createNotification(
                    this.followBackNotification(event)
                );
                await this.notificationService.deleteNotification(
                    oldNotification
                );
            }
        }
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
