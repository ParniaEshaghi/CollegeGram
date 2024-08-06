import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { signUpDto } from "../modules/user/dto/signup.dto";
import { handleExpress } from "../utility/handle-express";
import { HttpError } from "../utility/http-errors";
import { loginDto } from "../modules/user/dto/login.dto";
import { ZodError } from "zod";

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
            res.cookie("token", token, {httpOnly: true});
            res.status(200).send(message);
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

    return app;
};
