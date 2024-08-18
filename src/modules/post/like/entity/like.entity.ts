import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../../user/entity/user.entity";
import { PostEntity } from "../../entity/post.entity";
import { CommentEntity } from "../../comment/entity/comment.entity";

@Entity("postLikes")
export class PostLikeEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.postLikes)
    user!: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.likes)
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}

@Entity("commentLikes")
export class CommentLikeEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.commentLikes)
    user!: UserEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.likes)
    comment!: CommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
