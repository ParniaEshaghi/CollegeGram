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
    likes!: CommentLikeEntity[];

    @OneToMany(() => CommentEntity, (comment) => comment.parent)
    children!: CommentEntity[];

    @ManyToOne(() => CommentEntity, (comment) => comment.children)
    parent!: CommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
