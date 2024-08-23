import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../utility/http-errors";
import { User } from "../../user/model/user.model";
import { CommentService } from "../comment/comment.service";
import { SavedPostService } from "../../user/savedPost/savedPost.service";
import {
    PostWithUsername,
    toPostPage,
    toPostWithUsername,
} from "../model/post.model";
import { PostService } from "../post.service";
import { CommentLikeRepository, PostLikeRepository } from "./like.repository";
import { Comment, toPostCommentList } from "../comment/model/comment.model";

export class PostLikeService {
    constructor(
        private postLikeRepo: PostLikeRepository,
        private postService: PostService,
        private savedPostService: SavedPostService
    ) {}

    private async getLikeStatus(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like = await this.postLikeRepo.checkExistance(user, post);

        const like_status = like ? true : false;
        return like_status;
    }

    public async likePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, postId);

        if (like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.create(user, post);

        return { message: "Post liked" };
    }

    public async unLikePost(user: User, postId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, postId);

        if (!like_status) {
            throw new BadRequestError();
        }

        await this.postLikeRepo.delete(user, post);

        return { message: "Post unliked" };
    }

    public async getPostByPostId(
        user: User,
        postId: string,
        baseUrl: string
    ): Promise<PostWithUsername> {
        if (!user) {
            throw new UnauthorizedError();
        }

        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new NotFoundError();
        }

        const like = await this.postLikeRepo.checkExistance(user, post);
        const like_status = like ? true : false;

        const save = await this.savedPostService.getPostSaveStatus(
            user,
            post.id
        );
        const save_status = save ? true : false;

        return toPostPage(post, baseUrl, like_status, save_status);
    }
}

export class CommentLikeService {
    constructor(
        private commentLikeRepo: CommentLikeRepository,
        private commentService: CommentService,
        private postService: PostService
    ) {}

    private async getLikeStatus(user: User, commentId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const comment = await this.commentService.getCommentById(commentId);
        if (!comment) {
            throw new NotFoundError();
        }

        const like = await this.commentLikeRepo.checkExistance(user, comment);

        const like_status = like ? true : false;
        return like_status;
    }

    public async likeComment(user: User, commentId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const comment = await this.commentService.getCommentById(commentId);
        if (!comment) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, commentId);

        if (like_status) {
            throw new BadRequestError();
        }

        await this.commentLikeRepo.create(user, comment);

        return { message: "Comment liked" };
    }

    public async unLikeComment(user: User, commentId: string) {
        if (!user) {
            throw new UnauthorizedError();
        }

        const comment = await this.commentService.getCommentById(commentId);
        if (!comment) {
            throw new NotFoundError();
        }

        const like_status = await this.getLikeStatus(user, commentId);

        if (!like_status) {
            throw new BadRequestError();
        }

        await this.commentLikeRepo.delete(user, comment);

        return { message: "Comment unliked" };
    }

    public async commentList(
        user: User,
        postId: string,
        page: number,
        limit: number,
        baseUrl: string
    ) {
        const post = this.postService.getPost(postId);

        if (!post) {
            throw new NotFoundError();
        }

        const commentList = await this.commentService.getComments(
            postId,
            page,
            limit
        );

        return {
            data: await this.transformComments(user, commentList.data, baseUrl),
            meta: {
                page: page,
                limit: limit,
                total: commentList.total,
                totalPage: Math.ceil(commentList?.total / limit),
            },
        };
    }

    private async transformComments(
        user: User,
        comments: Comment[],
        baseUrl: string
    ): Promise<any[]> {
        return Promise.all(
            comments.map(async (comment) => {
                const likeStatus = await this.getLikeStatus(user, comment.id);
                const transformedComment = toPostCommentList(
                    comment,
                    likeStatus,
                    baseUrl
                );

                if (comment.children && comment.children.length > 0) {
                    transformedComment.children = await this.transformComments(
                        user,
                        comment.children,
                        baseUrl
                    );
                }

                return transformedComment;
            })
        );
    }
}
