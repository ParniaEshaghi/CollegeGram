import { NotFoundError, UnauthorizedError } from "../../../utility/http-errors";
import { User } from "../../user/model/user.model";
import { PostService } from "../post.service";
import { CommentRepository } from "./comment.repository";
import { CommentDto } from "./dto/comment.dto";
import {
    Comment,
    toCommentWithUsername,
    toPostCommentList,
} from "./model/comment.model";

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

    // public async commentList(
    //     postId: string,
    //     page: number,
    //     limit: number,
    //     baseUrl: string
    // ) {
    //     const post = this.postService.getPost(postId);

    //     if (!post) {
    //         throw new NotFoundError();
    //     }

    //     const commentList = await this.commentRepo.getComments(
    //         postId,
    //         page,
    //         limit
    //     );

    //     return {
    //         data: this.transformComments(commentList.data, baseUrl),
    //         meta: {
    //             page: page,
    //             limit: limit,
    //             total: commentList.total,
    //             totalPage: Math.ceil(commentList?.total / limit),
    //         },
    //     };
    // }

    // transformComments = (comments: Comment[], baseUrl: string): any[] => {
    //     return comments.map((comment) => {
    //         const transformedComment = toPostCommentList(comment, baseUrl);
    //         if (comment.children) {
    //             transformedComment.children = this.transformComments(
    //                 comment.children,
    //                 baseUrl
    //             );
    //         }
    //         return transformedComment;
    //     });
    // };

    public async getComments(postId: string, page: number, limit: number) {
        return await this.commentRepo.getComments(postId, page, limit);
    };
}
