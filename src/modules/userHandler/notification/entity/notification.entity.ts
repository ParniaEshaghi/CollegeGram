import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { CommentEntity } from "../../../postHandler/comment/entity/comment.entity";
import { PostEntity } from "../../../postHandler/post/entity/post.entity";

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

    @Column({
        type: "enum",
        enum: [
            "tage",
            "likePost",
            "followAccept",
            "followRequest",
            "followed",
            "followBack",
            "comment",
        ],
    })
    type!:
        | "tage"
        | "likePost"
        | "followAccept"
        | "followRequest"
        | "followed"
        | "followBack"
        | "comment";

    @ManyToOne(() => PostEntity, (post) => post.notifications, {
        nullable: true,
    })
    post!: PostEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.notifications, {
        nullable: true,
    })
    comment!: CommentEntity;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
