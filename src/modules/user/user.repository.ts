import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";

export class UserRepository {
    private userRepo: Repository<UserEntity>;

    constructor(appDataSource: DataSource) {
        this.userRepo = appDataSource.getRepository(UserEntity);
    }
}