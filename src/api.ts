import { DataSource } from "typeorm";
import express from "express";
import { makeUserRouter } from "./routes/user.route";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { ReadVResult } from "fs";
import { errorHandler } from "./middlewares/error-handler.middleware";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  const userRepository = new UserRepository(dataSource);
  const userService = new UserService(userRepository);

  app.use("/user", makeUserRouter(userService));

  app.use(errorHandler);

  return app;
};


