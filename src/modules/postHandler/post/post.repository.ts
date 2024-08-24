import { DataSource, Repository } from "typeorm";
import { Post, UpdatePost } from "./model/post.model";
import { PostEntity } from "./entity/post.entity";
import { User } from "../../userHandler/user/model/user.model";

export interface CreatePost {
    user: User;
    images: string[];
    caption: string;
    tags: string[];
    mentions: string[];
    like_count: number;
    comment_count: number;
    saved_count: number;
}

export class PostRepository {
    private postRepo: Repository<PostEntity>;
    constructor(appDataSorce: DataSource) {
        this.postRepo = appDataSorce.getRepository(PostEntity);
    }

    public create(post: CreatePost): Promise<Post> {
        return this.postRepo.save(post);
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
}
