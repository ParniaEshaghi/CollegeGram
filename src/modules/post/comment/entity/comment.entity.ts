import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "../../entity/post.entity";
import { UserEntity } from "../../../user/entity/user.entity";
import { CommentLikeEntity } from "../../like/entity/like.entity";
import { CommentLike } from "../../like/model/like.model";
import { Comment } from "../model/comment.model";

@Entity("comments")
export class CommentEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => PostEntity, (post) => post.comments)
    post!: PostEntity;

    @ManyToOne(() => UserEntity, (user) => user.comments)
    user!: UserEntity;

    @Column()
    text!: string;

    @Column()
    like_count!: number;

    @OneToMany(() => CommentLikeEntity, (commentLike) => commentLike.comment)
    likes!: CommentLike[];

    @OneToMany(() => CommentEntity, (comment) => comment.parent)
    children!: Comment[];

    @ManyToOne(() => CommentEntity, (comment) => comment.children)
    parent!: Comment;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
