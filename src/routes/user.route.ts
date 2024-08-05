import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { signUpDto } from "../modules/user/dto/user.dto";
import { handleExpress } from "../utility/handle-express";

export const makeUserRouter = (userService: UserService) => {
    const app = Router();

    app.post("/signup", (req, res) => {
        const dto = signUpDto.parse(req.body);
        handleExpress(res, () => userService.createUser(dto));
    });

    return app;
}