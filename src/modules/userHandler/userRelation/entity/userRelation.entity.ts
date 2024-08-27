import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { FollowStatus, RelationTypes } from "../model/userRelation.model";

@Entity("userRelations")
export class UserRelationEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.followers)
    follower!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.followings)
    following!: UserEntity;

    @Column({
        type: "enum",
        enum: ["follow", "close", "block"],
    })
    type!: RelationTypes;

    @Column({
        type: "enum",
        enum: ["pending", "accepted", "rejected"],
    })
    followStatus!: FollowStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
