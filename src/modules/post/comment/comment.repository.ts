import { DataSource, Repository } from "typeorm";
import { CommentEntity } from "./entity/comment.entity";
import { Comment, CommentsList, CreateComment } from "./model/comment.model";
import { Post } from "../model/post.model";
import { User } from "../../user/model/user.model";

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
            where: { post: { id: postId } },
            relations: ["children"],
        });

        return { data: response, total: total };
    }
}
