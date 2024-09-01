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
import { UpdatePostDto } from "./dto/updatePost.dto";
import { UserService } from "../../userHandler/user/user.service";
import { UserRelation } from "../../userHandler/userRelation/model/userRelation.model";
import { UserRelationService } from "../../userHandler/userRelation/userRelation.service";

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private userService: UserService,
        private userRelationService: UserRelationService
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

        const mentionResult = await this.checkMentions(postDto.mentions, user);
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
            close_status: postDto.close_status,
        };

        const createdPost = await this.postRepo.create(newPost);

        return toPostWithUsername(createdPost, baseUrl);
    }

    private async checkMentions(
        mentions: string[],
        user: User
    ): Promise<boolean> {
        const results = await Promise.all(
            mentions.map(async (mention) => {
                const mentionedUser = await this.userService.getUserByUsername(
                    mention
                );
                if (mentionedUser) {
                    const mentionedUserBlockList =
                        await this.userRelationService.getAllBlockList(
                            mentionedUser
                        );
                    if (
                        mentionedUserBlockList.filter(
                            (mentionedUserBlock) =>
                                mentionedUserBlock.following.username ==
                                user.username
                        ).length != 0
                    ) {
                        return false;
                    }
                    return true;
                }
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

        return toPostWithUsername(post, baseUrl);
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: UpdatePostDto,
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

        const deletedImagesFilenames = postDto.deletedImages.map(
            (deletedImageLink) => {
                const deletedImagesFilename = deletedImageLink.match(
                    /[^/]+\.(jpg|jpeg|png|gif)$/i
                );
                if (!deletedImagesFilename) {
                    throw new BadRequestError();
                }
                return deletedImagesFilename[0];
            }
        );

        const postImages = post.images.filter(
            (image) => !deletedImagesFilenames.includes(image)
        );

        postImages.push(...postImagesFileNames);

        const mentionResult = await this.checkMentions(postDto.mentions, user);
        if (!mentionResult) {
            throw new NotFoundError();
        }

        const editedPost: UpdatePost = {
            id: postId,
            user: user,
            images: postImages,
            caption: postDto.caption,
            tags: this.extractTags(postDto.caption),
            mentions: postDto.mentions,
            close_status: postDto.close_status,
        };
        const updatedPost = await this.postRepo.update(editedPost);

        return toPostWithUsername(updatedPost, baseUrl);
    }

    public async getPost(postId: string): Promise<Post | null> {
        return await this.postRepo.findPostById(postId);
    }

    public async getExplorePosts(
        followings: UserRelation[],
        page: number,
        limit: number
    ) {
        return await this.postRepo.getExplorePosts(followings, page, limit);
    }
}
