import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "../../post/entity/post.entity";
import { UserRelationEntity } from "../userRelation/entity/userRelation.entity";
import { CommentEntity } from "../../post/comment/entity/comment.entity";
import {
    CommentLikeEntity,
    PostLikeEntity,
} from "../../post/like/entity/like.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    profilePicture!: string;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;

    @Column({
        type: "enum",
        enum: ["public", "private"],
    })
    profileStatus!: "public" | "private";

    @Column()
    bio!: string;

    @Column()
    follower_count!: number;

    @Column()
    following_count!: number;

    @Column()
    post_count!: number;

    @OneToMany(() => PostEntity, (post) => post.user)
    posts!: PostEntity[];

    @OneToMany(() => UserRelationEntity, (relation) => relation.follower)
    followers!: UserRelationEntity[];

    @OneToMany(() => UserRelationEntity, (relation) => relation.following)
    followings!: UserRelationEntity[];

    @OneToMany(() => CommentEntity, (relation) => relation.user)
    comments!: CommentEntity[];

    @OneToMany(() => PostLikeEntity, (relation) => relation.user)
    postLikes!: PostLikeEntity[];

    @OneToMany(() => CommentLikeEntity, (relation) => relation.user)
    commentLikes!: CommentLikeEntity[];

    @OneToMany(() => CommentEntity, (relation) => relation.user)
    savedPosts!: CommentEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
