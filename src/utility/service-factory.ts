import { DataSource } from "typeorm";
import { UserRepository } from "../modules/user/user.repository";
import { PasswordResetTokenRepository } from "../modules/user/forgetPassword/forgetPassword.repository";
import { EmailService } from "../modules/email/email.service";
import { ForgetPasswordService } from "../modules/user/forgetPassword/forgetPassword.service";
import { UserRelationRepository } from "../modules/user/userRelation/userRelation.repository";
import { UserService } from "../modules/user/user.service";
import { UserRelationService } from "../modules/user/userRelation/userRelation.service";
import { PostRepository } from "../modules/post/post.repository";
import { PostService } from "../modules/post/post.service";
import { CommentRepository } from "../modules/post/comment/comment.repository";
import { CommentService } from "../modules/post/comment/comment.service";
import {
    CommentLikeRepository,
    PostLikeRepository,
} from "../modules/post/like/like.repository";
import {
    CommentLikeService,
    PostLikeService,
} from "../modules/post/like/like.service";
import { SavedPostRepository } from "../modules/user/savedPost/savedPost.repository";
import { SavedPostService } from "../modules/user/savedPost/savedPost.service";

export class ServiceFactory {
    private dataSource: DataSource;

    private userRepository: UserRepository;
    private passwordResetTokenRepository: PasswordResetTokenRepository;
    private emailService: EmailService;
    private forgetPasswordService: ForgetPasswordService;
    private userRelationRepository: UserRelationRepository;
    private userService: UserService;
    private userRelationService: UserRelationService;
    private postRepository: PostRepository;
    private postService: PostService;
    private commentRepository: CommentRepository;
    private commentService: CommentService;
    private savedPostRepo: SavedPostRepository;
    private savedPostService: SavedPostService;
    private postLikeRepo: PostLikeRepository;
    private postLikeService: PostLikeService;
    private commentLikeRepo: CommentLikeRepository;
    private commentLikeService: CommentLikeService;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;

        this.userRepository = new UserRepository(this.dataSource);
        this.passwordResetTokenRepository = new PasswordResetTokenRepository(
            this.dataSource
        );
        this.emailService = new EmailService();
        this.forgetPasswordService = new ForgetPasswordService(
            this.passwordResetTokenRepository,
            this.emailService
        );
        this.userRelationRepository = new UserRelationRepository(
            this.dataSource
        );
        this.userService = new UserService(
            this.userRepository,
            this.forgetPasswordService
        );
        this.userRelationService = new UserRelationService(
            this.userRelationRepository,
            this.userService
        );
        this.postRepository = new PostRepository(this.dataSource);
        this.postService = new PostService(this.postRepository);
        this.commentRepository = new CommentRepository(this.dataSource);
        this.commentService = new CommentService(
            this.commentRepository,
            this.postService
        );

        this.savedPostRepo = new SavedPostRepository(this.dataSource);
        this.savedPostService = new SavedPostService(
            this.savedPostRepo,
            this.postService
        );

        this.postLikeRepo = new PostLikeRepository(this.dataSource);
        this.postLikeService = new PostLikeService(
            this.postLikeRepo,
            this.postService,
            this.savedPostService
        );
        this.commentLikeRepo = new CommentLikeRepository(this.dataSource);
        this.commentLikeService = new CommentLikeService(
            this.commentLikeRepo,
            this.commentService,
            this.postService
        );
    }

    getUserService(): UserService {
        return this.userService;
    }

    getUserRelationService(): UserRelationService {
        return this.userRelationService;
    }

    getPostService(): PostService {
        return this.postService;
    }

    getCommentService(): CommentService {
        return this.commentService;
    }

    getPostLikeService(): PostLikeService {
        return this.postLikeService;
    }

    getCommentLikeService(): CommentLikeService {
        return this.commentLikeService;
    }

    getSavedPostService(): SavedPostService {
        return this.savedPostService;
    }
}
