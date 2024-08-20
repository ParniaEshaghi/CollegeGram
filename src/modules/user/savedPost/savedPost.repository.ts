import { DataSource, Repository } from "typeorm";
import { SavedPostsEntity } from "./entity/savedPost.entity";
import { User } from "../model/user.model";
import { Post } from "../../post/model/post.model";
import { PostEntity } from "../../post/entity/post.entity";
import { SavedPost } from "./model/savedPost.model";

export class SavedPostRepository {
    private savedPostRepo: Repository<SavedPostsEntity>;
    constructor(private appDataSource: DataSource) {
        this.savedPostRepo = appDataSource.getRepository(SavedPostsEntity);
    }

    public async create(user: User, post: Post): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const postRepo = manager.getRepository(PostEntity);
            const savedPostRepo = manager.getRepository(SavedPostsEntity);
            await savedPostRepo.save({ user, post });
            await postRepo.update(
                { id: post.id },
                { saved_count: () => "saved_count + 1" }
            );
        });
    }

    public async delete(user: User, post: Post): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const postRepo = manager.getRepository(PostEntity);
            const savedPostRepo = manager.getRepository(SavedPostsEntity);
            await savedPostRepo.softDelete({
                user: user,
                post: { id: post.id },
            });
            await postRepo.update(
                { id: post.id },
                { saved_count: () => "saved_count - 1" }
            );
        });
    }

    public async checkExistance(
        user: User,
        post: Post
    ): Promise<SavedPost | null> {
        const response = await this.savedPostRepo.findOne({
            where: {
                user: { username: user.username },
                post: { id: post.id },
            },
        });

        return response;
    }
}
