import { User } from "./user.model";

export interface UserRelation {
    follower: User;
    following: User;
}
