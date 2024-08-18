import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../entity/user.entity";
import { PostEntity } from "../../../post/entity/post.entity";

@Entity("savedPosts")
export class SavedPostsEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.savedPosts)
    user!: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.saves)
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
