import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { PostService } from "../../post/post.service";
import { User } from "../model/user.model";
import { SavedPostRepository } from "./savedPost.repository";

export class SavedPostService {
    constructor(
        private savedPostRepo: SavedPostRepository,
        private postService: PostService
    ) {}

    public async getPostSaveStatus(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const save = await this.savedPostRepo.checkExistance(user, post);

        const save_status = save ? true : false;
        return save_status;
    }

    public async savePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const save_status = await this.getPostSaveStatus(user, postId);

        if (save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.create(user, post);

        return { message: "Post saved" };
    }

    public async unSavePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const save_status = await this.getPostSaveStatus(user, postId);

        if (!save_status) {
            throw new BadRequestError();
        }

        await this.savedPostRepo.delete(user, post);

        return { message: "Post unsaved" };
    }
}
