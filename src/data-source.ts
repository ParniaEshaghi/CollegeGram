import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./modules/userHandler/user/entity/user.entity";
import { PasswordResetTokenEntity } from "./modules/userHandler/forgetPassword/entity/forgetPassword.entity";
import { PostEntity } from "./modules/postHandler/post/entity/post.entity";
import { UserRelationEntity } from "./modules/userHandler/userRelation/entity/userRelation.entity";
import { PostLikeEntity } from "./modules/postHandler/postLike/entity/postLike.entity";
import { CommentEntity } from "./modules/postHandler/comment/entity/comment.entity";
import { SavedPostsEntity } from "./modules/userHandler/savedPost/entity/savedPost.entity";
import { CommentLikeEntity } from "./modules/postHandler/commentLike/entity/commentLike.entity";
import { NotificationEntity } from "./modules/userHandler/notification/entity/notification.entity";
import { UserNotificationEntity } from "./modules/userHandler/notification/userNotification/entity/userNotification.entity";

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
        PostLikeEntity,
        CommentLikeEntity,
        CommentEntity,
        SavedPostsEntity,
        NotificationEntity,
        UserNotificationEntity,
    ],
    migrations: [],
    subscribers: [],
});
