import { promises } from "dns";
import { HttpError, NotFoundError, UnauthorizedError } from "../../utility/http-errors";
import { User } from "../user/model/user.model";
import { PostDto } from "./entity/dto/post.dto";
import { Post, PostWithoutUser } from "./model/post.model";
import { PostRepository } from "./post.repository";
import { PostEntity } from "./entity/post.entity";

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
}
