import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
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
    post_count!: number;
}
