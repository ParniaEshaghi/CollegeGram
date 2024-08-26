import { DataSource, IsNull, Repository } from "typeorm";
import { CommentEntity } from "./entity/comment.entity";
import { Comment, CommentsList, CreateComment } from "./model/comment.model";
import { PostEntity } from "../post/entity/post.entity";

export class CommentRepository {
    private commentRepo: Repository<CommentEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentRepo = appDataSource.getRepository(CommentEntity);
    }

    public async create(comment: CreateComment): Promise<Comment> {
        return await this.appDataSource.manager.transaction(async (manager) => {
            const commentRepo = manager.getRepository(CommentEntity);
            const postRepo = manager.getRepository(PostEntity);
            const newComment = await commentRepo.save(comment);
            await postRepo.update(
                { id: comment.post.id },
                { comment_count: () => "comment_count + 1" }
            );
            return newComment;
        });
    }

    public async findById(id: string): Promise<Comment | null> {
        return await this.commentRepo.findOne({ where: { id } });
    }

    public async getComments(
        postId: string,
        page: number,
        limit: number
    ): Promise<CommentsList> {
        const [response, total] = await this.commentRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { post: { id: postId }, parent: IsNull() },
            relations: ["children", "user"],
        });

        await Promise.all(
            response.map(async (comment) => {
                comment.children = await this.getChildren(comment.id);
            })
        );

        return { data: response, total: total };
    }

    public async getChildren(parentId: string): Promise<Comment[]> {
        const children = await this.commentRepo.find({
            where: { parent: { id: parentId } },
            relations: ["children", "user"],
        });
        for (const child of children) {
            child.children = await this.getChildren(child.id);
        }
        return children;
    }
}
