import {
    ForbiddenError,
    HttpError,
    NotFoundError,
} from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import { User, UserWithoutPassword } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
import nodemailer from "nodemailer";
import { PasswordResetTokenRepository } from "./forgetPassword.repository";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { DecodedToken } from "../../middlewares/auth.middleware";
import { UserRelationRepository } from "./userRelation.repository";
import { Post } from "../post/model/post.model";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private passwordResetTokenRepo: PasswordResetTokenRepository,
        private userRelationRepo: UserRelationRepository
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

        let user;

        if (success) {
            user = await this.getUserByEmail(credential);
        } else {
            user = await this.getUserByUsername(credential);
        }

        if (!user) {
            throw new HttpError(401, "Invalid credential");
        }

        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 2);
        const token = crypto.randomUUID();
        const token_hash = await hashGenerator(token);

        const resetToken = await this.passwordResetTokenRepo.create({
            token: token_hash,
            expiration: expirationTime,
            username: user.username,
        });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: "cgramcgram421@gmail.com",
                pass: "astjstwkacpkhtsq ",
            },
            logger: true,
            debug: true,
            secure: false,
        });

        const mailOptions = {
            from: "Cgram App",
            to: user.email,
            subject: "Password Reset",
            text: `Click on the following link to reset your password: http://37.32.6.230/reset-password/${resetToken.id}~${token}`,
        };

        try {
            await transporter.sendMail(mailOptions);
            return {
                message: "Password reset link sent to your email account",
            };
        } catch (error) {
            throw new HttpError(500, "Error sending email");
        }
    }

    public async resetPassword(newPass: string, token: string) {
        let id, resetToken;
        try {
            [id, resetToken] = token.split("~");
        } catch (e) {
            throw new HttpError(401, "Unauthorized");
        }

        const dbtoken = await this.passwordResetTokenRepo.findById(id);
        if (!dbtoken) {
            throw new HttpError(401, "Unauthorized");
        }
        if (dbtoken.expiration.getTime() < new Date().getTime()) {
            this.passwordResetTokenRepo.delete(dbtoken.id);
            throw new ForbiddenError();
        }
        const isMatch = await bcrypt.compare(resetToken, dbtoken.token);
        if (!isMatch) {
            throw new HttpError(401, "Unauthorized");
        }
        const password_hash = await hashGenerator(newPass);
        this.userRepo.updatePassword(dbtoken.username, password_hash);
        this.passwordResetTokenRepo.delete(dbtoken.id);
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

    public async getUserFollowers(username: string): Promise<string[]> {
        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }
        return this.userRepo.findUserFollowers(user.username);
    }

    public async getUserFollowings(username: string): Promise<string[]> {
        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }
        return this.userRepo.findUserFollowings(user.username);
    }

    public async getUserPosts(username: string): Promise<Post[]> {
        return await this.userRepo.getUserPosts(username);
    }
    
    public async getFollowStatus(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.getUserByUsername(following_username);
        if (!following) {
            throw new NotFoundError();
        }
        return await this.userRelationRepo.checkExistance(user, following);
    }

    public async follow(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.getUserByUsername(following_username);
        if (!following) {
            throw new NotFoundError();
        }
        this.userRepo.incrementFollowingCount(user.username);
        this.userRepo.incrementFollowerCount(following.username);
        return this.userRelationRepo.create(user, following);
    }

    public async unfollow(user: User, following_username: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        const following = await this.getUserByUsername(following_username);
        if (!following) {
            throw new NotFoundError();
        }
        this.userRepo.decrementFollowingCount(user.username);
        this.userRepo.decrementFollowerCount(following.username);
        return this.userRelationRepo.delete(user, following);
    }
}
