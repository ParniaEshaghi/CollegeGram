import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Timestamp,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("passwordRestTokens")
export class PasswordResetTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    token!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    expiration!: Date;

    @Column()
    username!: string;
}
