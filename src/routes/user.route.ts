import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { signUpDto } from "../modules/user/dto/signup.dto";
import { handleExpress } from "../utility/handle-express";
import { loginDto } from "../modules/user/dto/login.dto";
import { auth } from "../middlewares/auth.middleware";
import { profileUpload } from "../middlewares/upload.middleware";
import { editProfileDto } from "../modules/user/dto/edit-profile.dto";
import { UserRelationService } from "../modules/user/userRelation/userRelation.service";

export const makeUserRouter = (
    userService: UserService,
    UserRelationService: UserRelationService
) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userService.createUser(dto));
    });

    app.post("/signin", (req, res) => {
        const dto = loginDto.parse(req.body);
        handleExpress(
            res,
            async () => {
                const { message, token } = await userService.login(dto);
                return { message, token };
            },
            ({ token }) => {
                res.cookie("token", token);
            }
        );
    });

    app.post("/forgetpassword", (req, res) => {
        const { credential } = req.body;
        handleExpress(res, () => userService.forgetPassword(credential));
    });

    app.post("/resetpassword", (req, res) => {
        const { newPass, token } = req.body;
        handleExpress(res, () => userService.resetPassword(newPass, token));
    });

    app.post(
        "/editprofile",
        auth(userService),
        profileUpload,
        async (req, res) => {
            const dto = editProfileDto.parse(req.body);
            const pictureFilename = req.file ? req.file.filename : "";
            handleExpress(res, () =>
                userService.editProfile(
                    req.user,
                    pictureFilename,
                    dto,
                    req.base_url
                )
            );
        }
    );

    app.get("/geteditprofile", auth(userService), (req, res) => {
        handleExpress(res, async () =>
            userService.getEditProfile(req.user, req.base_url)
        );
    });

    app.get("/profileInfo", auth(userService), (req, res) => {
        handleExpress(res, async () =>
            userService.getProfileInfo(req.user, req.base_url)
        );
    });

    app.post("/follow/:username", auth(userService), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.follow(req.user, username)
        );
    });

    app.post("/unfollow/:username", auth(userService), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.unfollow(req.user, username)
        );
    });

    app.get("/:username", auth(userService), (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.userProfile(req.user, username, req.base_url)
        );
    });

    app.get("/followers/:username", auth(userService), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            UserRelationService.followerList(req.user, username, page, limit)
        );
    });

    app.get("/followings/:username", auth(userService), (req, res) => {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        handleExpress(res, () =>
            UserRelationService.followeingList(req.user, username, page, limit)
        );
    });

    return app;
};
