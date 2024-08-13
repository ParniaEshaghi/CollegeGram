import { HttpError, NotFoundError } from "../../../utility/http-errors";
import { User } from "../model/user.model";
import { UserService } from "../user.service";
import { UserRelationRepository } from "./userRelation.repository";

export class UserRelationService {
    constructor(
        private userRelationRepo: UserRelationRepository,
        private userService: UserService
    ) {}

    public async getFollowStatus(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const relation = await this.userRelationRepo.checkExistance(
            user,
            following
        );
        const follow_status = relation ? true : false;
        return follow_status;
    }

    public async follow(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const follow_status = await this.getFollowStatus(
            user,
            following.username
        );
        if (follow_status) {
            throw new HttpError(400, "Bad Request");
        }
        await this.userRelationRepo.create(user, following);
        return { message: "User followed" };
    }

    public async unfollow(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.userService.getUserByUsername(
            following_username
        );
        if (!following) {
            throw new NotFoundError();
        }
        const follow_status = await this.getFollowStatus(
            user,
            following.username
        );
        if (!follow_status) {
            throw new HttpError(400, "Bad Request");
        }
        await this.userRelationRepo.delete(user, following);
        return { message: "User unfollowed" };
    }
}
