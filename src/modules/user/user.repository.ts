import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { User } from "./model/user.model";

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

    public async update(user: User) {
        await this.userRepo.update(
            { username: user.username },
            { tokens: user.tokens }
        );
    }
}
