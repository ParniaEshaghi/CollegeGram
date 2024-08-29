import {
    BadRequestError,
    ForbiddenError,
    HttpError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { PostDto } from "./dto/post.dto";
import {
    Post,
    PostWithUsername,
    toPostWithUsername,
    UpdatePost,
} from "./model/post.model";
import { CreatePost, PostRepository } from "./post.repository";
import path from "path";
import { promises as fs } from "fs";
import { UserService } from "../../userHandler/user/user.service";

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private userService: UserService
    ) {}

    public async createPost(
        user: User,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        if (!user) {
            throw new UnauthorizedError();
        }

        const mentionResult = await this.checkMentions(postDto.mentions);
        if (!mentionResult) {
            throw new NotFoundError();
        }

        const newPost: CreatePost = {
            user: user,
            images: postImagesFileNames,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
            like_count: 0,
            comment_count: 0,
            saved_count: 0,
        };

        const createdPost = await this.postRepo.create(newPost);

        return toPostWithUsername(createdPost, baseUrl);
    }

    private async checkMentions(mentions: string[]): Promise<boolean> {
        const results = await Promise.all(
            mentions.map(async (mention) => {
                const check = await this.userService.getUserByUsername(mention);
                return check !== null;
            })
        );
        return results.every((result) => result === true);
    }

    private extractTags(caption: string): string[] {
        const tags = caption.match(/#\w+/g);
        return tags ? tags.map((tag) => tag.toLocaleLowerCase()) : [];
    }

    public async getPostByPostId(
        user: User,
        postId: string,
        baseUrl: string
    ): Promise<PostWithUsername> {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError();
        }

        // if (post.user.username !== user.username) {
        //     throw new ForbiddenError();
        // }

        return toPostWithUsername(post, baseUrl);
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError();
        }

        if (post.user.username !== user.username) {
            throw new ForbiddenError();
        }

        const mentionResult = await this.checkMentions(postDto.mentions);
        if (!mentionResult) {
            throw new NotFoundError();
        }

        await this.deleteUnusedImages(post.images);

        const editedPost: UpdatePost = {
            id: postId,
            user: user,
            images: postImagesFileNames,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
        };
        const updatedPost = await this.postRepo.update(editedPost);

        return toPostWithUsername(updatedPost, baseUrl);
    }

    public async deleteUnusedImages(images: string[]) {
        for (const img of images) {
            const filePath = path.join(
                __dirname,
                "../../../images/posts/",
                img
            );
            await fs.unlink(filePath).catch(() => {
                console.error(`Failed to delete image: ${filePath}`);
            });
        }
    }

    public async getPost(postId: string): Promise<Post | null> {
        return await this.postRepo.findPostById(postId);
    }
}
