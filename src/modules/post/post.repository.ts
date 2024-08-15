import { DataSource, Repository } from "typeorm";
import { Post } from "./model/post.model";
import { PostEntity } from "./entity/post.entity";

export class PostRepository {
    private postRepo: Repository<PostEntity>;
    constructor(appDataSorce: DataSource) {
        this.postRepo = appDataSorce.getRepository(PostEntity);
    }

    public create(post: Post): Promise<PostEntity> {
        return this.postRepo.save(post);
    }

    public findPostById(postId: string): Promise<PostEntity | null> {
        return this.postRepo.findOne({ where: { id: postId } });
    }

    public getPostsByUser(username: string): Promise<PostEntity[]> {
        return this.postRepo.find({ where: { user: { username } } });
    }

    public update(id: string, post: Post): Promise<PostEntity> {
        return this.postRepo.save({
            id,
            ...post,
        });
    }
}
