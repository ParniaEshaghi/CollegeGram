import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import { ThreadEntity } from "../../thread/entity/thread.entity";

@Entity("messages")
export class MessageEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.messages)
    sender!: UserEntity;

    @ManyToOne(() => ThreadEntity, (thread) => thread.messages)
    thread!: ThreadEntity;

    @Column({ nullable: true })
    text!: string;

    @Column({ nullable: true })
    image!: string;

    @Column()
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
