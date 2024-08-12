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

    @Column()
    expiration!: Date;

    @Column()
    username!: string;
}
