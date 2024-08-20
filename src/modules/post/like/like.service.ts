import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../../user/model/user.model";
import { SavedPostService } from "../../user/savedPost/savedPost.service";
import {
    PostWithUsername,
    toPostPage,
    toPostWithUsername,
} from "../model/post.model";
import { PostService } from "../post.service";
import { PostLikeRepository } from "./like.repository";

export class PostLikeService {
    constructor(
        private postLikeRepo: PostLikeRepository,
        private postService: PostService,
        private savedPostService: SavedPostService
    ) {}

    private async getLikeStatus(user: User, postId: string) {
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

    public async getPostByPostId(
        user: User,
        postId: string,
        baseUrl: string
    ): Promise<PostWithUsername> {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like = await this.postLikeRepo.checkExistance(user, post);
        const like_status = like ? true : false;

        const save = await this.savedPostService.getPostSaveStatus(
            user,
            post.id
        );
        const save_status = save ? true : false;

        return toPostPage(post, baseUrl, like_status, save_status);
    }
}
