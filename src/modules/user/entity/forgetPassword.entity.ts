import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

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
