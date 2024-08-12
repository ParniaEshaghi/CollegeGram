import { CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";

@Entity("userRelations")
export class UserRelationEntity {
    @ManyToOne(() => UserEntity, (user) => user.followers)
    follower!: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.followings)
    following!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;
}
