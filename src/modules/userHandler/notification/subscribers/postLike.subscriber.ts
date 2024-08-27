import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from "typeorm";
import { PostLikeEntity } from "../../../postHandler/postLike/entity/postLike.entity";
import { CreateNotification } from "../model/notification.model";
import { NotificationService } from "../notification.service";

@EventSubscriber()
export class PostLikeSubscriber
    implements EntitySubscriberInterface<PostLikeEntity>
{
    constructor(private notificationService: NotificationService) {}

    listenTo() {
        return PostLikeEntity;
    }

    async afterInsert(event: InsertEvent<PostLikeEntity>): Promise<void> {
        const notification: CreateNotification = {
            recipient: event.entity.post.user,
            sender: event.entity.user,
            type: "likePost",
            post: event.entity.post,
        };
        await this.notificationService.createNotification(notification);
    }
}
