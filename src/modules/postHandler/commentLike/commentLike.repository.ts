import { DataSource, Repository } from "typeorm";
import { User } from "../../userHandler/user/model/user.model";
import { Comment } from "../comment/model/comment.model";
import { CommentLikeEntity } from "./entity/commentLike.entity";
import { CommentEntity } from "../comment/entity/comment.entity";
import { CommentLike } from "./model/commentLike.model";

type NewType = User;

export class CommentLikeRepository {
    private commentLikeRepo: Repository<CommentLikeEntity>;

    constructor(private appDataSource: DataSource) {
        this.commentLikeRepo = appDataSource.getRepository(CommentLikeEntity);
    }

    public async create(user: User, comment: Comment): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const commentRepo = manager.getRepository(CommentEntity);
            const commentLikeRepo = manager.getRepository(CommentLikeEntity);
            await commentLikeRepo.save({ user, comment });
            await commentRepo.update(
                { id: comment.id },
                { like_count: () => "like_count + 1" }
            );
        });
    }

    public async delete(user: User, comment: Comment): Promise<void> {
        await this.appDataSource.manager.transaction(async (manager) => {
            const commentRepo = manager.getRepository(CommentEntity);
            const commentLikeRepo = manager.getRepository(CommentLikeEntity);
            await commentLikeRepo.softDelete({
                user: user,
                comment: { id: comment.id },
            });
            await commentRepo.update(
                { id: comment.id },
                { like_count: () => "like_count - 1" }
            );
        });
    }

    public async checkExistance(
        user: NewType,
        comment: Comment
    ): Promise<CommentLike | null> {
        const response = await this.commentLikeRepo.findOne({
            where: {
                user: { username: user.username },
                comment: { id: comment.id },
            },
        });
        return response;
    }
}
