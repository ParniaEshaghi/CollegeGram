import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { postUpload } from "../middlewares/upload.middleware";
import { postDto } from "../modules/postHandler/post/dto/post.dto";
import { handleExpress } from "../utility/handle-express";
import { commentDto } from "../modules/postHandler/comment/dto/comment.dto";
import { PostHandler } from "../modules/postHandler/postHandler";
import { UserHandler } from "../modules/userHandler/userHandler";

export const makePostRouter = (
    userHandler: UserHandler,
    postHandlerService: PostHandler
) => {
    const app = Router();

    app.post("/createpost", auth(userHandler), postUpload, (req, res) => {
        const dto = postDto.parse(req.body);
        const postImageFilenames = (req.files as Express.Multer.File[]).map(
            (file) => file.filename
        );
        handleExpress(
            res,
            async () =>
                await postHandlerService.createPost(
                    req.user,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
        );
    });

    app.get("/:postid", auth(userHandler), (req, res) => {
        const postId: string = req.params.postid;
        handleExpress(
            res,
            async () =>
                await postHandlerService.getPostByPostId(
                    req.user,
                    postId,
                    req.base_url
                )
        );
    });

    app.post(
        "/updatepost/:postid",
        auth(userHandler),
        postUpload,
        (req, res) => {
            const postid = req.params.postid;
            const dto = postDto.parse(req.body);
            const postImageFilenames = (req.files as Express.Multer.File[]).map(
                (file) => file.filename
            );
            handleExpress(res, () =>
                postHandlerService.updatePost(
                    req.user,
                    postid,
                    dto,
                    postImageFilenames,
                    req.base_url
                )
            );
        }
    );

    app.post("/comment", auth(userHandler), (req, res) => {
        const dto = commentDto.parse(req.body);
        handleExpress(res, () =>
            postHandlerService.createComment(req.user, dto)
        );
    });

    app.post("/likepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () => postHandlerService.likePost(req.user, postid));
    });

    app.post("/unlikepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () =>
            postHandlerService.unLikePost(req.user, postid)
        );
    });

    app.post("/likecomment/:commentid", auth(userHandler), (req, res) => {
        const commentid = req.params.commentid;
        handleExpress(res, () =>
            postHandlerService.likeComment(req.user, commentid)
        );
    });

    app.post("/unlikecomment/:commentid", auth(userHandler), (req, res) => {
        const commentid = req.params.commentid;
        handleExpress(res, () =>
            postHandlerService.unLikeComment(req.user, commentid)
        );
    });

    app.get("/comments/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        handleExpress(res, () =>
            postHandlerService.commentList(
                req.user,
                postid,
                page,
                limit,
                req.base_url
            )
        );
    });

    return app;
};
