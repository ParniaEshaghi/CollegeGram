import { DataSource, IsNull, Repository } from "typeorm";
import { CommentEntity } from "./entity/comment.entity";
import { Comment, CommentsList, CreateComment } from "./model/comment.model";

export class CommentRepository {
    private commentRepo: Repository<CommentEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentRepo = appDataSource.getRepository(CommentEntity);
    }

    public create(comment: CreateComment): Promise<Comment> {
        return this.commentRepo.save(comment);
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
