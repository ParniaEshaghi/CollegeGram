import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { auth } from "../middlewares/auth.middleware";
import { UserService } from "../modules/user/user.service";
import { postUpload } from "../middlewares/upload.middleware";
import { postDto } from "../modules/post/dto/post.dto";
import { handleExpress } from "../utility/handle-express";
import { commentDto } from "../modules/post/comment/dto/comment.dto";
import { CommentService } from "../modules/post/comment/comment.service";
import { PostLikeService } from "../modules/post/like/like.service";

export const makePostRouter = (
    postService: PostService,
    userService: UserService,
    commentService: CommentService,
    postLikeService: PostLikeService
) => {
    const app = Router();

    app.post("/createpost", auth(userService), postUpload, (req, res) => {
        const dto = postDto.parse(req.body);
        const postImageFilenames = (req.files as Express.Multer.File[]).map(
            (file) => file.filename
        );
        handleExpress(
            res,
            async () =>
                await postService.createPost(
                    req.user,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
        );
    });

    app.get("/:postid", auth(userService), (req, res) => {
        const postId: string = req.params.postid;
        handleExpress(
            res,
            async () =>
                await postService.getPostInfo(req.user, postId, req.base_url)
                await postLikeService.getPostByPostId(
                    req.user,
                    postId,
                    req.base_url
                )
        );
    });

    app.post(
        "/updatepost/:postid",
        auth(userService),
        postUpload,
        (req, res) => {
            const postid = req.params.postid;
            const dto = postDto.parse(req.body);
            const postImageFilenames = (req.files as Express.Multer.File[]).map(
                (file) => file.filename
            );
            handleExpress(res, () =>
                postService.updatePost(
                    req.user,
                    postid,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
            );
        }
    );

    app.post("/comment", auth(userService), (req, res) => {
        const dto = commentDto.parse(req.body);
        handleExpress(res, () => commentService.createComment(req.user, dto));

    app.post("/likepost/:postid", auth(userService), (req, res) => {
        const postid = req.params.postid;

        handleExpress(res, () => postLikeService.likePost(req.user, postid));
    });

    app.post("/unlikepost/:postid", auth(userService), (req, res) => {
        const postid = req.params.postid;

        handleExpress(res, () => postLikeService.unLikePost(req.user, postid));
    });

    return app;
};
