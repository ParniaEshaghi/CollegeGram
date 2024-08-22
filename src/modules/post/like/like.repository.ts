import { DataSource, Repository } from "typeorm";
import { Post } from "../model/post.model";
import { User } from "../../user/model/user.model";
import { CommentLikeEntity, PostLikeEntity } from "./entity/like.entity";
import { PostEntity } from "../entity/post.entity";
import { CommentLike, PostLike } from "./model/like.model";
import { CommentEntity } from "../comment/entity/comment.entity";
import { CommentRepository } from "../comment/comment.repository";
import { Comment } from "../comment/model/comment.model";

export class PostLikeRepository {
    private postLikeRepo: Repository<PostLikeEntity>;

    constructor(private appDataSource: DataSource) {
        this.postLikeRepo = appDataSource.getRepository(PostLikeEntity);
    }

    public async create(user: User, post: Post): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const postRepo = manager.getRepository(PostEntity);
            const postLikeRepo = manager.getRepository(PostLikeEntity);
            await postLikeRepo.save({ user, post });
            await postRepo.update(
                { id: post.id },
                { like_count: () => "like_count + 1" }
            );
        });
    }

    public async delete(user: User, post: Post): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const postRepo = manager.getRepository(PostEntity);
            const postLikeRepo = manager.getRepository(PostLikeEntity);
            await postLikeRepo.softDelete({
                user: user,
                post: { id: post.id },
            });
            await postRepo.update(
                { id: post.id },
                { like_count: () => "like_count - 1" }
            );
        });
    }

    public async checkExistance(
        user: User,
        post: Post
    ): Promise<PostLike | null> {
        const response = await this.postLikeRepo.findOne({
            where: {
                user: { username: user.username },
                post: { id: post.id },
            },
        });

        return response;
    }
}

export class CommentLikeRepository {
    private commentLikeRepo: Repository<CommentLikeEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentLikeRepo = appDataSource.getRepository(CommentLikeEntity);
    }

    public async create(user: User, comment: Comment): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const commentRepo = manager.getRepository(CommentEntity);
            const commentLikeRepo = manager.getRepository(CommentLikeEntity);
            await commentLikeRepo.save({ user, comment });
            await commentRepo.update(
                { id: comment.id },
                { like_count: () => "like_count + 1" }
            );
        });
    }

    public async delete(user: User, comment: Comment): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const commentRepo = manager.getRepository(CommentEntity);
            const commentLikeRepo = manager.getRepository(CommentLikeEntity);
            await commentLikeRepo.softDelete({
                user: user,
                comment: { id: comment.id },
            });
            await commentRepo.update(
                { id: comment.id },
                { like_count: () => "like_count - 1" }
            );
        });
    }

    public async checkExistance(
        user: User,
        comment: Comment
    ): Promise<CommentLike | null> {
        const response = await this.commentLikeRepo.findOne({
            where: {
                user: { username: user.username },
                comment: { id: comment.id },
            },
        });
        return response;
    }
}
