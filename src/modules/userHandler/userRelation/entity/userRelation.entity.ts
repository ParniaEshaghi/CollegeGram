import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";

@Entity("userRelations")
export class UserRelationEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.followers)
    follower!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.followings)
    following!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
