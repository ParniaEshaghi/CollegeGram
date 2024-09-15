import { User } from "../../userHandler/user/model/user.model";
import { UserSearchHistoryRepository } from "./userSearchHistory.repository";

export class UserSearchHistoryService {
    constructor(private userSearchHistoryRepo: UserSearchHistoryRepository) {}
    public async createUserSearchHistory(user: User, query: string) {
        return await this.userSearchHistoryRepo.create(user, query);
    }

    public async getUserSearchHistory(user: User, limit: number) {
        return await this.userSearchHistoryRepo.getUserSearchHistory(
            user,
            limit
        );
    }
}
