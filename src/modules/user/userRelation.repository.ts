import { DataSource, Repository } from "typeorm";
import { UserRelationEntity } from "./entity/userRelation.entity";
import { User } from "./model/user.model";

export class UserRelationRepository {
    private userRelationRepo: Repository<UserRelationEntity>;

    constructor(appDataSource: DataSource) {
        this.userRelationRepo = appDataSource.getRepository(UserRelationEntity);
    }

    public create(
        follower: User,
        following: User
    ): Promise<UserRelationEntity> {
        return this.userRelationRepo.save({ follower, following });
    }

    public async delete(follower: User, following: User): Promise<void> {
        await this.userRelationRepo.delete({ follower, following });
    }
}
