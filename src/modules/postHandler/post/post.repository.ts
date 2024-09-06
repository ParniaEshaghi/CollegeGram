import { DataSource, In, Repository } from "typeorm";
import { CreatePost, Post, UpdatePost } from "./model/post.model";
import { PostEntity } from "./entity/post.entity";
import { UserEntity } from "../../userHandler/user/entity/user.entity";
import { UserRelation } from "../../userHandler/userRelation/model/userRelation.model";

export class PostRepository {
    private postRepo: Repository<PostEntity>;
    constructor(private appDataSource: DataSource) {
        this.postRepo = appDataSource.getRepository(PostEntity);
    }

    public async create(post: CreatePost): Promise<Post> {
        return await this.postRepo.save(post);
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

    public async getPostCount(username: string): Promise<number> {
        const postCount = await this.postRepo.count({
            where: { user: { username } },
        });
        return postCount;
    }
}
