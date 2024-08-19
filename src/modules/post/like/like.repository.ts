import { DataSource, Repository } from "typeorm";
import { Post } from "../model/post.model";
import { User } from "../../user/model/user.model";
import { PostRepository } from "../post.repository";
import { PostLikeEntity } from "./entity/like.entity";
import { PostEntity } from "../entity/post.entity";
import { PostLike } from "./model/like.model";

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
