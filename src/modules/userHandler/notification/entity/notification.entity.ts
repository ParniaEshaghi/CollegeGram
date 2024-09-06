import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";
import { UserNotificationEntity } from "../userNotification/entity/userNotification.entity";
import { NotificationTypes } from "../model/notification.model";

@Entity("notifications")
export class NotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.recipientNotifications, {
        nullable: false,
    })
    recipient!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.senderNotifications, {
        nullable: false,
    })
    sender!: UserEntity;

    @OneToMany(
        () => UserNotificationEntity,
        (userNotification) => userNotification.notification,
        {
            onDelete: "CASCADE",
        }
    )
    userNotifications!: UserNotificationEntity[];

    @Column({
        type: "enum",
        enum: [
            "tags",
            "likePost",
            "followAccept",
            "followRequest",
            "followed",
            "followBackRequest",
            "followBackAccept",
            "comment",
        ],
    })
    type!: NotificationTypes;

    @ManyToOne(() => PostEntity, (post) => post.notifications, {
        nullable: true,
    })
    post!: PostEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.notifications, {
        nullable: true,
    })
    comment!: CommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
