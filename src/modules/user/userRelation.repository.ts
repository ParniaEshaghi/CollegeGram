import { DataSource, Repository } from "typeorm";
import { UserRelationEntity } from "./entity/userRelation.entity";
import { User } from "./model/user.model";
import { UserRelation } from "./model/userRelation.model";

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

    public checkExistance(follower: User, following: User): Promise<boolean> {
        return this.userRelationRepo.exists({
            where: { follower, following },
        });
    };

    public async delete(follower: User, following: User): Promise<void> {
        await this.userRelationRepo.softDelete({ follower, following });
    }
}
