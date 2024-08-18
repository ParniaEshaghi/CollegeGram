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
import { CommentEntity } from "../comment/entity/comment.entity";
import { PostLikeEntity } from "../like/entity/like.entity";
import { SavedPostsEntity } from "../../user/savedPost/entity/savedPost.entity";

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
