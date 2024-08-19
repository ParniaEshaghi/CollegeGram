import { DataSource, Repository } from "typeorm";
import { CommentEntity } from "./entity/comment.entity";
import { Comment } from "./model/comment.model";
import { Post } from "../model/post.model";
import { User } from "../../user/model/user.model";

export class CommentRepository {
    private commentRepo: Repository<CommentEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentRepo = appDataSource.getRepository(CommentEntity);
    }

    public create(comment: Comment): Promise<Comment> {
        return this.commentRepo.save(comment);
    }

    public async findById(id: string): Promise<Comment | null> {
        return await this.commentRepo.findOne({ where: { id } });
    }
}
