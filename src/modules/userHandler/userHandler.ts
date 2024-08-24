import { ForgetPasswordService } from "./forgetPassword/forgetPassword.service";
import { SavedPostService } from "./savedPost/savedPost.service";
import { EditProfileDto } from "./user/dto/edit-profile.dto";
import { LoginDto } from "./user/dto/login.dto";
import { SignUpDto } from "./user/dto/signup.dto";
import { User, UserWithoutPassword } from "./user/model/user.model";
import { UserService } from "./user/user.service";
import { followerFollowingListUserResponse } from "./userRelation/model/userRelation.model";
import { UserRelationService } from "./userRelation/userRelation.service";

export class UserHandler {
    constructor(
        private userService: UserService,
        private userRelationService: UserRelationService,
        private savedService: SavedPostService
    ) {}

    public async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        return this.userService.createUser(dto);
    }

    public async login(dto: LoginDto) {
        return this.userService.login(dto);
    }

    public async forgetPassword(credential: string) {
        return this.userService.forgetPassword(credential);
    }

    public async resetPassword(newPass: string, token: string) {
        return this.userService.resetPassword(newPass, token);
    }

    public getEditProfile(user: User, baseUrl: string) {
        return this.userService.getEditProfile(user, baseUrl);
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto,
        baseUrl: string
    ) {
        return this.userService.editProfile(
            user,
            pictureFilename,
            dto,
            baseUrl
        );
    }

    public async getProfileInfo(user: User, baseUrl: string) {
        return this.userService.getProfileInfo(user, baseUrl);
    }

    public async getUserPosts(username: string, baseUrl: string) {
        return this.userService.getUserPosts(username, baseUrl);
    }

    public async follow(user: User, following_username: string) {
        return this.userRelationService.follow(user, following_username);
    }

    public async unfollow(user: User, following_username: string) {
        return this.userRelationService.unfollow(user, following_username);
    }

    public async userProfile(
        session_user: User,
        username: string,
        baseUrl: string
    ) {
        return this.userRelationService.userProfile(
            session_user,
            username,
            baseUrl
        );
    }

    public async followerList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followerList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async followeingList(
        session_user: User,
        username: string,
        page: number,
        limit: number,
        baseUrl: string
    ): Promise<followerFollowingListUserResponse | undefined> {
        return this.userRelationService.followeingList(
            session_user,
            username,
            page,
            limit,
            baseUrl
        );
    }

    public async savePost(user: User, postId: string) {
        return this.savedService.savePost(user, postId);
    }

    public async unSavePost(user: User, postId: string) {
        return this.savedService.unSavePost(user, postId);
    }

    public async getUserByUsername(username: string) {
        return this.userService.getUserByUsername(username);
    }
}