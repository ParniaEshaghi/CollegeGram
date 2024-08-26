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
import { UserEntity } from "../../../userHandler/user/entity/user.entity";
import { CommentEntity } from "../../comment/entity/comment.entity";
import { PostLikeEntity } from "../../postLike/entity/postLike.entity";
import { SavedPostsEntity } from "../../../userHandler/savedPost/entity/savedPost.entity";
import { NotificationEntity } from "../../../userHandler/notification/entity/notification.entity";

@Entity("Posts")
export class PostEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar", { array: true })
    images!: string[];

    @Column()
    caption!: string;

    @Column("varchar", { array: true })
    tags!: string[];

    @Column("varchar", { array: true })
    mentions!: string[];

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user!: UserEntity;

    @OneToMany(() => PostLikeEntity, (postLike) => postLike.post)
    likes!: PostLikeEntity[];

    @OneToMany(() => CommentEntity, (comment) => comment.post)
    comments!: CommentEntity[];

    @OneToMany(() => SavedPostsEntity, (savedPost) => savedPost.post)
    saves!: SavedPostsEntity[];

    @OneToMany(() => NotificationEntity, (notification) => notification.post)
    notifications!: NotificationEntity[];

    @Column()
    like_count!: number;

    @Column()
    comment_count!: number;

    @Column()
    saved_count!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
