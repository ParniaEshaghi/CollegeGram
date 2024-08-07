import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { User } from "./model/user.model";

interface UpdateProfile {
    password: string;
    email: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
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
            where: { username }
        });
    }

    public findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { email }
        });
    }

    public create(user: User): Promise<User> {
        return this.userRepo.save(user);
    }

    public async updatePassword(user: User, newPass: string): Promise<void> {
        await this.userRepo.update(
            { username: user.username },
            { password: newPass }
        );
    }

    public async updateProfile(username: string, updated: UpdateProfile): Promise<void> {
        await this.userRepo.update(
            {
                username: username
            }, {
            password: updated.password,
            email: updated.email,
            profilePicture: updated.profilePicture,
            firstName: updated.firstName,
            lastName: updated.lastName,
            profileStatus: updated.profileStatus,
            bio: updated.bio,
        });
    }

    // public async addToken(user: User) {
    //     await this.userRepo.update(
    //         { username: user.username },
    //         { tokens: user.tokens }
    //     );
    // }
}
