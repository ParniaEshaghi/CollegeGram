import { User } from "../../userHandler/user/model/user.model";
import { PostSearchHistory } from "./model/postSearchHistory.model";
import { PostSearchHistoryRepository } from "./postSearchHistory.repository";

export class PostSearchHistoryService {
    constructor(private postSearchHistoryRepo: PostSearchHistoryRepository) {}
    public async createPostSearchHistory(user: User, query: string) {
        return await this.postSearchHistoryRepo.create(user, query);
    }

    public async getPostSearchHistory(user: User, limit: number) {
        return await this.postSearchHistoryRepo.getPostSearchHistory(
            user,
            limit
        );
    }
}
