import { NotFoundError, UnauthorizedError } from "../../../utility/http-errors";
import { User } from "../../user/model/user.model";
import { PostService } from "../post.service";
import { CommentRepository } from "./comment.repository";
import { CommentDto } from "./dto/comment.dto";
import { toCommentWithUsername } from "./model/comment.model";

export class CommentService {
    constructor(
        private commentRepo: CommentRepository,
        private postService: PostService
    ) {}

    public async createComment(user: User, commentDto: CommentDto) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(commentDto.postId);

        if (!post) {
            throw new NotFoundError();
        }

        const comment = commentDto.commentId
            ? (await this.getCommentById(commentDto.commentId))!
            : undefined;

        const createdComment = await this.commentRepo.create({
            post,
            user,
            text: commentDto.text,
            like_count: 0,
            parent: comment,
        });

        return toCommentWithUsername(createdComment);
    }

    public getCommentById(commentId: string) {
        const comment = this.commentRepo.findById(commentId);
        if (!comment) {
            throw new NotFoundError();
        }
        return comment;
    }
}
