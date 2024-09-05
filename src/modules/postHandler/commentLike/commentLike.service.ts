import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../../userHandler/user/model/user.model";
import { CommentService } from "../comment/comment.service";
import { CommentLikeRepository } from "./commentLike.repository";

export class CommentLikeService {
    constructor(
        private commentLikeRepo: CommentLikeRepository,
        private commentService: CommentService
    ) {}

    public async getLikeStatus(user: User, commentId: string) {
        const comment = await this.commentService.getCommentById(commentId);
        const like = await this.commentLikeRepo.checkExistance(user, comment);
        const like_status = like ? true : false;
        return like_status;
    }

    public async likeComment(user: User, commentId: string) {
        const comment = await this.commentService.getCommentById(commentId);
        const like_status = await this.getLikeStatus(user, commentId);

        if (like_status) {
            throw new BadRequestError();
        }

        await this.commentLikeRepo.create(user, comment);
        return { message: "Comment liked" };
    }

    public async unLikeComment(user: User, commentId: string) {
        const comment = await this.commentService.getCommentById(commentId);
        const like_status = await this.getLikeStatus(user, commentId);

        if (!like_status) {
            throw new BadRequestError();
        }

        await this.commentLikeRepo.delete(user, comment);
        return { message: "Comment unliked" };
    }
}
