import { Router } from "express";
import { PostService } from "../modules/post/post.service";
import { auth } from "../middlewares/auth.middleware";
import { UserService } from "../modules/user/user.service";
import { postUpload } from "../middlewares/upload.middleware";
import { postDto } from "../modules/post/entity/dto/post.dto";
import { HttpError } from "../utility/http-errors";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { handleExpress } from "../utility/handle-express";

export const makePostRouter = (
    postService: PostService,
    userService: UserService
) => {
    const app = Router();

    app.post("/createpost", auth(userService), postUpload, async (req, res) => {
        const dto = postDto.parse(req.body);
        // const baseUrl = `${req.protocol}://${req.get("host")}`;
        if (req.files) {
            const postImageFilenames = (req.files as Express.Multer.File[]).map(
                (file) => file.filename
            );

            try {
                const newPost = await postService.createPost(
                    req.user,
                    dto,
                    postImageFilenames,
                    req.baseUrl
                );
                res.status(200).send(newPost);
                return;
            } catch (error) {
                if (
                    error instanceof HttpError ||
                    error instanceof MulterError ||
                    error instanceof ZodError
                ) {
                    res.status(400).send({ error: error.message });
                    return;
                }
                res.status(500).send({});
                return;
            }
        } else {
            res.status(400).json({ message: "No files uploaded" });
        }
    });

    app.get("/:postid", auth(userService), async (req, res) => {
        const postId: string = req.params.postid;
        // const baseUrl = `${req.protocol}://${req.get("host")}`;

        try {
            const post = await postService.getPostByPostId(
                req.user,
                postId,
                req.baseUrl
            );
            res.status(200).send(post);
            return;
        } catch (error) {
            if (error instanceof HttpError || error instanceof ZodError) {
                res.status(400).send({ error: error.message });
                return;
            }
            res.status(500).send({});
            return;
        }
    });

    app.post(
        "/updatepost/:postid",
        auth(userService),
        postUpload,
        async (req, res) => {
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
                    req.baseUrl,
                )
            );
        }
    );

    return app;
};
