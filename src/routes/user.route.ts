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

    app.post("/forgetpassword", async (req, res) => {
        const { credential } = req.body;
        handleExpress(res, () => userService.forgetPassword(credential));
    });

    app.post("/resetpassword", async (req, res) => {
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
                    req.baseUrl
                )
            );
        }
    );

    app.get("/geteditprofile", auth(userService), (req, res) => {
        handleExpress(res, async () =>
            userService.getEditProfile(req.user, req.baseUrl)
        );
    });

    app.get("/profileInfo", auth(userService), (req, res) => {
        handleExpress(res, async () =>
            userService.getProfileInfo(req.user, req.baseUrl)
        );
    });

    app.post("/follow/:username", auth(userService), async (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.follow(req.user, username)
        );
    });

    app.post("/unfollow/:username", auth(userService), async (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.unfollow(req.user, username)
        );
    });

    app.get("/:username", auth(userService), async (req, res) => {
        const username = req.params.username;
        handleExpress(res, () =>
            UserRelationService.userProfile(req.user, username, req.baseUrl)
        );
    });

    return app;
};
