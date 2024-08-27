import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";

@EventSubscriber()
export class CommentSubscriber
    implements EntitySubscriberInterface<CommentEntity>
{
    constructor(private notificationService: NotificationService) {}

    listenTo() {
        return CommentEntity;
    }

    async afterInsert(event: InsertEvent<CommentEntity>): Promise<void> {
        if (event.entity.parent) {
            return;
        }
        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "comment",
            post: event.entity.post,
            comment: event.entity,
        };
        await this.notificationService.createNotification(notification);
    }
}
