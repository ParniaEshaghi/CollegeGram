import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { User } from "./model/user.model";
import { Post } from "../post/model/post.model";
import { hashGenerator } from "../../utility/hash-generator";

interface CreateUser {
    username: string;
    password: string;
    email: string;
}

interface UpdateProfile {
    password?: string;
    email: string;
    firstname: string;
    lastname: string;
    profileStatus: "public" | "private";
    bio: string;
}

export class UserRepository {
    private userRepo: Repository<UserEntity>;

    constructor(appDataSource: DataSource) {
        this.userRepo = appDataSource.getRepository(UserEntity);
    }

    public findByUsername(username: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { username },
        });
    }

    public findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { email },
        });
    }

    public findById(id: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { id },
        });
    }

    public async hashPassword(password: string): Promise<string> {
        return await hashGenerator(password);
    }

    public async create(user: CreateUser): Promise<User> {
        return this.userRepo.save({
            username: user.username,
            password: await this.hashPassword(user.password),
            email: user.email,
            profilePicture: "",
            firstname: "",
            lastname: "",
            profileStatus: "public",
            bio: "",
            follower_count: 0,
            following_count: 0,
            post_count: 0,
        });
    }

    public async updatePassword(
        username: string,
        password: string
    ): Promise<void> {
        await this.userRepo.update({ username }, { password });
    }

    public async updateProfile(
        user: User,
        profilePicture: string,
        updated: UpdateProfile
    ): Promise<void> {
        const updatedData = {
            password: updated.password
                ? await this.hashPassword(updated.password)
                : user.password,
            email: updated.email,
            profilePicture: profilePicture,
            firstname: updated.firstname,
            lastname: updated.lastname,
            profileStatus: updated.profileStatus,
            bio: updated.bio,
        };
        await this.userRepo.update(
            {
                username: user.username,
            },
            updatedData
        );
    }

    public async getUserPosts(username: string): Promise<Post[]> {
        const userWithPosts = await this.userRepo.findOne({
            where: { username },
            relations: ["posts"],
        });

        if (userWithPosts) {
            return userWithPosts.posts;
        }

        return [];
    }
}
