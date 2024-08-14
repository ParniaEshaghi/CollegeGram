import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { signUpDto } from "../modules/user/dto/signup.dto";
import { handleExpress } from "../utility/handle-express";
import { HttpError } from "../utility/http-errors";
import { loginDto } from "../modules/user/dto/login.dto";
import { ZodError } from "zod";
import { auth } from "../middlewares/auth.middleware";
import { profileUpload } from "../middlewares/upload.middleware";
import { editProfileDto } from "../modules/user/dto/edit-profile.dto";
import { MulterError } from "multer";

export const makeUserRouter = (userService: UserService) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userService.createUser(dto));
    });

    app.post("/signin", async (req, res) => {
        //TODO: needs to be refactored for readability and to use the error-handler middleware and handle-express
        try {
            const dto = loginDto.parse(req.body);
            const { message, token } = await userService.login(dto);
            // res.cookie("token", token, { httpOnly: true });
            // res.cookie("token", token, { sameSite: "none" });

            res.status(200).send(token);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            if (error instanceof ZodError) {
                res.status(400).send({ message: error.message });
                return;
            }
            res.status(500).send();
        }
    });

    app.post("/forgetpassword", async (req, res) => {
        const { credential } = req.body;
        try {
            const { message } = await userService.forgetPassword(credential);
            res.status(200).send(message);
            return;
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            res.status(500).send();
        }
    });

    app.post("/resetpassword", async (req, res) => {
        const { newPass, token } = req.body;
        try {
            const { message } = await userService.resetPassword(newPass, token);
            res.status(200).send(message);
            return;
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            res.status(500).send();
        }
    });

    app.post("/editprofile", auth(userService), async (req, res) => {
        profileUpload(req, res, async (uploadError) => {
            if (uploadError) {
                return res.status(400).send({ error: uploadError.message });
            }

            try {
                const dto = editProfileDto.parse(req.body);
                const user = req.user;

                const pictureFilename = req.file ? req.file.filename : "";

                const result = await userService.editProfile(
                    user.username,
                    user.password,
                    pictureFilename, 
                    dto
                );

                res.status(200).send(result);
            } catch (error) {
                if (
                    error instanceof HttpError ||
                    error instanceof MulterError ||
                    error instanceof ZodError
                ) {
                    return res.status(400).send({ error: error.message });
                }
                console.log(error)
                res.status(500).send();
            }
        });
    });

    app.get("/geteditprofile", auth(userService), (req, res) => {
        try {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            const response = userService.getEditProfile(req.user, baseUrl);

            if (response.profilePicture) {
                response.profilePicture = `${baseUrl}/images/profiles/${response.profilePicture}`;
            }

            res.status(200).json(response);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            res.status(500).send();
        }
    });

    app.get("/profileInfo", auth(userService), (req, res) => {
        try {
            const baseUrl = `${req.protocol}://${req.get("host")}`; // Construct the base URL
            const response = userService.getProfileInfo(req.user, baseUrl); // Pass the base URL

            res.status(200).json(response);
            return;
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            if (error instanceof ZodError) {
                res.status(400).send({ message: error.message });
                return;
            }
            res.status(500).send();
        }
    });

    return app;
};
