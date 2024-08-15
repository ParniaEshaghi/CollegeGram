import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";

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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
