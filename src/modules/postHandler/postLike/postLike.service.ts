import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { PostService } from "../post/post.service";
import { PostLikeRepository } from "./postLike.repository";

export class PostLikeService {
    constructor(
        private postLikeRepo: PostLikeRepository,
        private postService: PostService
    ) {}

    public async getLikeStatus(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like = await this.postLikeRepo.checkExistance(user, post);

        const like_status = like ? true : false;
        return like_status;
    }

    public async likePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, postId);

        if (like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.create(user, post);

        return { message: "Post liked" };
    }

    public async unLikePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, postId);

        if (!like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.delete(user, post);

        return { message: "Post unliked" };
    }
}