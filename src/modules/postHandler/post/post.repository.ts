import { DataSource, In, Repository } from "typeorm";
import { Post, UpdatePost } from "./model/post.model";
import { PostEntity } from "./entity/post.entity";
import { User } from "../../userHandler/user/model/user.model";
import { UserEntity } from "../../userHandler/user/entity/user.entity";
import { UserRelation } from "../../userHandler/userRelation/model/userRelation.model";

export interface CreatePost {
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
    like_count: number;
    comment_count: number;
    saved_count: number;
    close_status: "close" | "normal";
}

export class PostRepository {
    private postRepo: Repository<PostEntity>;
    constructor(private appDataSource: DataSource) {
        this.postRepo = appDataSource.getRepository(PostEntity);
    }

    public async create(post: CreatePost): Promise<Post> {
        return await this.appDataSource.manager.transaction(async (manager) => {
            const userRepo = manager.getRepository(UserEntity);
            const postRepo = manager.getRepository(PostEntity);
            const newPost = await postRepo.save(post);
            await userRepo.update(
                { username: post.user.username },
                { post_count: () => "post_count + 1" }
            );
            return newPost;
        });
    }

    public findPostById(postId: string): Promise<Post | null> {
        return this.postRepo.findOne({
            where: { id: postId },
            relations: ["user"],
        });
    }

    public getPostsByUser(username: string): Promise<Post[]> {
        return this.postRepo.find({ where: { user: { username } } });
    }

    public update(post: UpdatePost): Promise<Post> {
        return this.postRepo.save(post);
    }

    public async getExplorePosts(
        followings: UserRelation[],
        page: number,
        limit: number
    ) {
        const [response, total] = await this.postRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                user: {
                    username: In(
                        followings.map(
                            (following) => following.following.username
                        )
                    ),
                },
            },
            relations: ["user"],
            order: {
                createdAt: "DESC",
            },
        });
        return { data: response, total: total };
    }
}
