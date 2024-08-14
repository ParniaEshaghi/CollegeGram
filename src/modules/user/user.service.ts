import { HttpError, NotFoundError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import { User, UserWithoutPassword } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { ForgetPasswordService } from "./forgetPassword/forgetPassword.service";
import { EmailService } from "../email/email.service";
import { Post } from "../post/model/post.model";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private forgetPasswordService: ForgetPasswordService,
        private emailService: EmailService
    ) {}

    async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        if (
            (await this.userRepo.findByEmail(dto.email)) ||
            (await this.userRepo.findByUsername(dto.username))
        ) {
            throw new HttpError(403, "Username and/or email already in use");
        }

        const password_hash = await hashGenerator(dto.password);

        const user = await this.userRepo.create({
            username: dto.username,
            password: password_hash,
            email: dto.email,
            profilePicture: "",
            firstName: "",
            lastName: "",
            profileStatus: "public",
            bio: "",
            follower_count: 0,
            following_count: 0,
            post_count: 0,
        });

        const userWithoutPass: UserWithoutPassword = {
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
            profileStatus: user.profileStatus,
            bio: user.bio,
            follower_count: user.follower_count,
            following_count: user.following_count,
            post_count: user.post_count,
        };

        return userWithoutPass;
    }

    public async login(dto: LoginDto) {
        const { success, error } = z.string().email().safeParse(dto.credential);

        const user = success
            ? await this.getUserByEmail(dto.credential)
            : await this.getUserByUsername(dto.credential);

        if (!user) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!user || !match) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const expiry = dto.keepMeSignedIn ? "7d" : "8h";

        const token = jwt.sign({ username: user.username }, "10", {
            expiresIn: expiry,
        });

        return { message: "Login successfull", token: token };
    }

    public async getUserByUsername(username: string) {
        return await this.userRepo.findByUsername(username);
    }

    public async getUserByEmail(credential: string) {
        return await this.userRepo.findByEmail(credential);
    }

    public async forgetPassword(credential: string) {
        if (!credential) {
            throw new HttpError(400, "Credential is  required");
        }
        const { success, error } = z.string().email().safeParse(credential);
        const user = success
            ? await this.getUserByEmail(credential)
            : await this.getUserByUsername(credential);

        if (!user) {
            throw new HttpError(401, "Invalid credential");
        }
        const { id, token } = await this.forgetPasswordService.createToken(
            user.username
        );
        const mailContent = {
            reciever: user.email,
            subject: "Password Reset",
            text: `Click on the following link to reset your password: http://37.32.6.230/reset-password/${id}~${token}`,
        };
        return await this.emailService.sendEmail(mailContent);
    }

    public async resetPassword(newPass: string, token: string) {
        const password_hash = await hashGenerator(newPass);
        const username = await this.forgetPasswordService.checkToken(token);
        this.userRepo.updatePassword(username, password_hash);
        return { message: "New password set" };
    }

    public getEditProfile(user: User, baseUrl: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const response = {
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            profileStatus: user.profileStatus,
            bio: user.bio,
            profilePicture: user.profilePicture
                ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
                : "",
        };

        return response;
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto
    ): Promise<UserWithoutPassword> {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const password_hash = dto.password
            ? await hashGenerator(dto.password)
            : user.password;

        await this.userRepo.updateProfile(user.username, {
            password: password_hash,
            email: dto.email,
            profilePicture: pictureFilename,
            firstName: dto.firstName,
            lastName: dto.lastName,
            profileStatus: dto.profileStatus,
            bio: dto.bio,
        });

        const newUser = await this.getUserByUsername(user.username);
        if (!newUser) {
            throw new NotFoundError();
        }
        const userWithoutPass: UserWithoutPassword = {
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            profileStatus: newUser.profileStatus,
            bio: newUser.bio,
            follower_count: newUser.follower_count,
            following_count: newUser.following_count,
            post_count: newUser.post_count,
        };
        return userWithoutPass;
    }

    public getProfileInfo(user: User, baseUrl: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const response = {
            username: user.username,
            firstname: user.firstName,
            lastname: user.lastName,
            bio: user.bio,
            // Construct full URL for profilePicture
            profilePicture: user.profilePicture
                ? `${baseUrl}/api/images/profiles/${user.profilePicture}`
                : "",
            posts: [],
            post_count: 0,
            follower_count: user.follower_count,
            following_count: user.following_count,
        };

        return response;
    }

    public async getUserPosts(username: string): Promise<Post[]> {
        return await this.userRepo.getUserPosts(username);
    }
}
