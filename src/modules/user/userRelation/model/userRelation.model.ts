import { User } from "../../model/user.model";

export interface UserRelation {
    follower: User;
    following: User;
}
