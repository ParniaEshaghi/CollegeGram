import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { auth } from "../middlewares/auth.middleware";
import { UserService } from "../modules/user/user.service";
import { postUpload } from "../middlewares/upload.middleware";
import { postDto } from "../modules/post/entity/dto/post.dto";
import { handleExpress } from "../utility/handle-express";

export const makePostRouter = (
    postService: PostService,
    userService: UserService
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
                    req.baseUrl
                )
        );
    });

    app.get("/:postid", auth(userService), (req, res) => {
        const postId: string = req.params.postid;
        handleExpress(
            res,
            async () =>
                await postService.getPostByPostId(req.user, postId, req.baseUrl)
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
                    req.baseUrl
                )
            );
        }
    );

    return app;
};
