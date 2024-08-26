import { DataSource } from "typeorm";
import { UserRepository } from "../modules/userHandler/user/user.repository";
import { PasswordResetTokenRepository } from "../modules/userHandler/forgetPassword/forgetPassword.repository";
import { EmailService } from "../modules/email/email.service";
import { ForgetPasswordService } from "../modules/userHandler/forgetPassword/forgetPassword.service";
import { UserRelationRepository } from "../modules/userHandler/userRelation/userRelation.repository";
import { UserService } from "../modules/userHandler/user/user.service";
import { UserRelationService } from "../modules/userHandler/userRelation/userRelation.service";
import { SavedPostRepository } from "../modules/userHandler/savedPost/savedPost.repository";
import { SavedPostService } from "../modules/userHandler/savedPost/savedPost.service";
import { PostRepository } from "../modules/postHandler/post/post.repository";
import { PostService } from "../modules/postHandler/post/post.service";
import { CommentRepository } from "../modules/postHandler/comment/comment.repository";
import { CommentService } from "../modules/postHandler/comment/comment.service";
import { PostLikeRepository } from "../modules/postHandler/postLike/postLike.repository";
import { PostLikeService } from "../modules/postHandler/postLike/postLike.service";
import { CommentLikeRepository } from "../modules/postHandler/commentLike/commentLike.repository";
import { CommentLikeService } from "../modules/postHandler/commentLike/commentLike.service";
import { PostHandler } from "../modules/postHandler/postHandler";
import { UserHandler } from "../modules/userHandler/userHandler";

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

    private postHandler: PostHandler;
    private userHandler: UserHandler;

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
        this.postService = new PostService(
            this.postRepository,
            this.userService
        );
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
            this.postService
        );
        this.commentLikeRepo = new CommentLikeRepository(this.dataSource);
        this.commentLikeService = new CommentLikeService(
            this.commentLikeRepo,
            this.commentService
        );

        this.postHandler = new PostHandler(
            this.postService,
            this.savedPostService,
            this.commentService,
            this.postLikeService,
            this.commentLikeService
        );

        this.userHandler = new UserHandler(
            this.userService,
            this.userRelationService,
            this.savedPostService
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

    getPostHandler(): PostHandler {
        return this.postHandler;
    }

    getUserHandler(): UserHandler {
        return this.userHandler;
    }
}
