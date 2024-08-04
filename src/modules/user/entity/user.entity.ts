import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { v4 } from "uuid";

@Entity("users")
export class UserEntity {
    @PrimaryColumn("uuid")
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
    firstName!: string;

    @Column()
    lastName!: string;

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
    tokens!: string[];

    @BeforeInsert()
    addId() {
        this.id = v4();
    }
}
