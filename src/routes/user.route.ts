import { Router } from "express";
import { signUpDto } from "../modules/userHandler/user/dto/signup.dto";
import { handleExpress } from "../utility/handle-express";
import { loginDto } from "../modules/userHandler/user/dto/login.dto";
import { auth } from "../middlewares/auth.middleware";
import { profileUpload } from "../middlewares/upload.middleware";
import { editProfileDto } from "../modules/userHandler/user/dto/edit-profile.dto";
import { UserHandler } from "../modules/userHandler/userHandler";

export const makeUserRouter = (userHandler: UserHandler) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userHandler.createUser(dto));
    });

    app.post("/signin", (req, res) => {
        const dto = loginDto.parse(req.body);
        handleExpress(
            res,
            async () => {
                const { message, token } = await userHandler.login(dto);
                return { message, token };
            },
            ({ token }) => {
                res.cookie("token", token);
            }
        );
    });

    app.post("/forgetpassword", (req, res) => {
        const { credential } = req.body;
        handleExpress(res, () => userHandler.forgetPassword(credential));
    });

    app.post("/resetpassword", (req, res) => {
        const { newPass, token } = req.body;
        handleExpress(res, () => userHandler.resetPassword(newPass, token));
    });

    app.post("/editprofile", auth(userHandler), profileUpload, (req, res) => {
        const dto = editProfileDto.parse(req.body);
        const pictureFilename = req.file ? req.file.filename : "";
        handleExpress(res, () =>
            userHandler.editProfile(
                req.user,
                pictureFilename,
                dto,
                req.base_url
            )
        );
    });

    app.get("/geteditprofile", auth(userHandler), (req, res) => {
        handleExpress(res, async () =>
            userHandler.getEditProfile(req.user, req.base_url)
        );
    });

    app.get("/profileInfo", auth(userHandler), (req, res) => {
        handleExpress(res, async () =>
            userHandler.getProfileInfo(req.user, req.base_url)
        );
    });

    app.post("/follow/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.follow(req.user, username));
    });

    app.post("/unfollow/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.unfollow(req.user, username));
    });

    app.post("/deletefollower/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.deleteFollower(req.user, username)
        );
    });

    app.post("/acceptrequest/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.acceptFollowRequest(req.user, username)
        );
    });

    app.post("/rejectrequest/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.rejectFollowRequest(req.user, username)
        );
    });

    app.post("/block/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.block(req.user, username));
    });

    app.post("/unblock/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () => userHandler.unblock(req.user, username));
    });

    app.get("/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            userHandler.userProfile(req.user, username, req.base_url)
        );
    });

    app.get("/followers/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.followerList(
                req.user,
                username,
                page,
                limit,
                req.base_url
            )
        );
    });

    app.get("/followings/:username", auth(userHandler), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            userHandler.followeingList(
                req.user,
                username,
                page,
                limit,
                req.base_url
            )
        );
    });

    app.post("/savepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () => userHandler.savePost(req.user, postid));
    });

    app.post("/unsavepost/:postid", auth(userHandler), (req, res) => {
        const postid = req.params.postid;
        handleExpress(res, () => userHandler.unSavePost(req.user, postid));
    });

    return app;
};
