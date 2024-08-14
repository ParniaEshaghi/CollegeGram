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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
