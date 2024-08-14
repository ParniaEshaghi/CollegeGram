import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./modules/user/entity/user.entity";
import { PasswordResetTokenEntity } from "./modules/user/forgetPassword/entity/forgetPassword.entity";
import { PostEntity } from "./modules/post/entity/post.entity";
import { UserRelationEntity } from "./modules/user/userRelation/entity/userRelation.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "admin",
    database: "cgram",
    synchronize: true,
    logging: false,
    entities: [
        UserEntity,
        PasswordResetTokenEntity,
        PostEntity,
        UserRelationEntity,
    ],
    migrations: [],
    subscribers: [],
});
