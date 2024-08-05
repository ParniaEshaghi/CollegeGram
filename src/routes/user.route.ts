import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { signUpDto } from "../modules/user/dto/user.dto";
import { handleExpress } from "../utility/handle-express";
import { HttpError } from "../utility/http-errors";

export const makeUserRouter = (userService: UserService) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userService.createUser(dto));
    });

    app.post("/signin", async (req, res) => {
        const { credential, password } = req.body;
        try {
            const { message, token } = await userService.login(credential, password);
            res.cookie("token", token, {httpOnly: true});
            res.status(200).send(message);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.status).send(error.message);
                return;
            }
            res.status(500).send();
        }
    });

    return app;
}