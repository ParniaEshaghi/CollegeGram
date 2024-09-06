import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { PostService } from "../../postHandler/post/post.service";
import { User } from "../user/model/user.model";
import { SavedPostRepository } from "./savedPost.repository";

export class SavedPostService {
    constructor(
        private savedPostRepo: SavedPostRepository,
        private postService: PostService
    ) {}

    public async getPostSaveStatus(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save = await this.savedPostRepo.checkExistance(user, post);
        const save_status = save ? true : false;
        return save_status;
    }

    public async savePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save_status = await this.getPostSaveStatus(user, postId);

        if (save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.create(user, post);
        return { message: "Post saved" };
    }

    public async unSavePost(user: User, postId: string) {
        const post = await this.postService.getPost(postId);
        const save_status = await this.getPostSaveStatus(user, postId);

        if (!save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.delete(user, post);
        return { message: "Post unsaved" };
    }

    public async getSavedPostCount(postId: string) {
        return await this.savedPostRepo.getPostSavedCount(postId);
    }
}
