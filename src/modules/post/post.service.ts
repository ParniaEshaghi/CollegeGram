import { promises } from "dns";
import {
    ForbiddenError,
    HttpError,
    NotFoundError,
    UnauthorizedError,
} from "../../utility/http-errors";
import { User } from "../user/model/user.model";
import { PostDto } from "./entity/dto/post.dto";
import { Post, PostWithoutUser } from "./model/post.model";
import { PostRepository } from "./post.repository";
import { PostEntity } from "./entity/post.entity";
import path from "path";
import { promises as fs } from "fs";

export class PostService {
    constructor(private postRepo: PostRepository) {}

    public async createPost(
        user: User,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithoutUser> {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const newPost: Post = {
            user: user,
            images: postImagesFileNames,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
        };

        try {
            const crestedPost = await this.postRepo.create(newPost);
            return {
                caption: crestedPost.caption,
                mentions: crestedPost.mentions,
                tags: crestedPost.tags,
                images: crestedPost.images.map(
                    (image) => `${baseUrl}/api/images/posts/${image}`
                ),
            };
        } catch (error) {
            throw new HttpError(500, "server error");
        }
    }

    private extractTags(caption: string): string[] {
        const tags = caption.match(/#\w+/g);
        return tags ? tags.map((tag) => tag.toLocaleLowerCase()) : [];
    }

    public async getPostByPostId(
        user: User,
        postId: string,
        baseUrl: string
    ): Promise<PostWithoutUser> {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const userPosts: Post[] = await this.postRepo.getPostsByUser(
            user.username
        );

        if (!userPosts.includes(post)) {
            throw new NotFoundError();
        }

        return {
            caption: post.caption,
            mentions: post.mentions,
            tags: post.tags,
            images: post.images.map(
                (image) => `${baseUrl}/api/images/posts/${image}`
            ),
        };
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithoutUser> {
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

        await this.deleteUnusedImages(post.images);

        const editedPost: Post = {
            user: user,
            images: postImagesFileNames,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
        };

        const updatedPost = await this.postRepo.update(postId, editedPost);
        return {
            caption: updatedPost.caption,
            mentions: updatedPost.mentions,
            tags: updatedPost.tags,
            images: updatedPost.images.map(
                (image) => `${baseUrl}/api/images/posts/${image}`
            ),
        };
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
}
