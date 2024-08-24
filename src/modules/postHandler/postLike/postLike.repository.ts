import { DataSource, Repository } from "typeorm";
import { Post } from "../post/model/post.model";
import { User } from "../../userHandler/user/model/user.model";
import { PostLikeEntity } from "./entity/postLike.entity";
import { PostEntity } from "../post/entity/post.entity";
import { PostLike } from "./model/postLike.model";

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
