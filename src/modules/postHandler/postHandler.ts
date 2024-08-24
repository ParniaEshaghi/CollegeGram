import { NotFoundError, UnauthorizedError } from "../../utility/http-errors";
import { User } from "../userHandler/user/model/user.model";
import { SavedPostService } from "../userHandler/savedPost/savedPost.service";
import { CommentService } from "./comment/comment.service";
import { CommentDto } from "./comment/dto/comment.dto";
import { Comment, toPostCommentList } from "./comment/model/comment.model";
import { CommentLikeService } from "./commentLike/commentLike.service";
import { PostDto } from "./post/dto/post.dto";
import { PostWithUsername, toPostPage } from "./post/model/post.model";
import { PostService } from "./post/post.service";
import { PostLikeService } from "./postLike/postLike.service";

export class PostHandler {
    constructor(
        private postService: PostService,
        private savedPostService: SavedPostService,
        private commentService: CommentService,
        private postLikeService: PostLikeService,
        private commentLikeService: CommentLikeService
    ) {}
    public async createPost(
        user: User,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        return this.postService.createPost(
            user,
            postDto,
            postImagesFileNames,
            baseUrl
        );
    }

    public async updatePost(
        user: User,
        postId: string,
        postDto: PostDto,
        postImagesFileNames: string[],
        baseUrl: string
    ): Promise<PostWithUsername> {
        return this.postService.updatePost(
            user,
            postId,
            postDto,
            postImagesFileNames,
            baseUrl
        );
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

        const like_status = await this.postLikeService.getLikeStatus(
            user,
            post.id
        );

        const save = await this.savedPostService.getPostSaveStatus(
            user,
            post.id
        );
        const save_status = save ? true : false;

        return toPostPage(post, baseUrl, like_status, save_status);
    }

    public likePost(user: User, postId: string) {
        return this.postLikeService.likePost(user, postId);
    }

    public unLikePost(user: User, postId: string) {
        return this.postLikeService.unLikePost(user, postId);
    }

    public createComment(user: User, commentDto: CommentDto) {
        return this.commentService.createComment(user, commentDto);
    }

    public likeComment(user: User, commentId: string) {
        return this.commentLikeService.likeComment(user, commentId);
    }

    public unLikeComment(user: User, commentId: string) {
        return this.commentLikeService.unLikeComment(user, commentId);
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
                const likeStatus = await this.commentLikeService.getLikeStatus(
                    user,
                    comment.id
                );
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
