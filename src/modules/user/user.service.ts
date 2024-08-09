import {
    ForbiddenError,
    HttpError,
    NotFoundError,
} from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import { User } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
const nodemailer = require("nodemailer");
import { PasswordResetTokenRepository } from "./forgetPassword.repository";
import { ForgetPassword } from "./model/forgetPassword.model";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { DecodedToken } from "../../middlewares/auth.middleware";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private passwordResetTokenRepo: PasswordResetTokenRepository
    ) {}

    async createUser(dto: SignUpDto): Promise<User> {
        if (
            (await this.userRepo.findByEmail(dto.email)) ||
            (await this.userRepo.findByUsername(dto.username))
        ) {
            throw new HttpError(403, "Username and/or email already in use");
        }

        const password_hash = await hashGenerator(dto.password);

        return this.userRepo.create({
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

        const token = jwt.sign({ username: user.username }, "10", {
            expiresIn: "1h",
        });
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 1);

        const resetToken: ForgetPassword = {
            token: token,
            expiration: expirationTime,
            username: user.username,
        };

        await this.passwordResetTokenRepo.create(resetToken);
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                type: "OAuth2",
                user: "cgramcgram421@gmail.com",
                pass: "astjstwkacpkhtsq ",
                clientId:
                    "449892707783-10aiulf85pc2niftmefbobplia2ipqa2.apps.googleusercontent.com",
                clientSecret: "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",
                refreshToken:
                    "1//04aZeeQ17Nad6CgYIARAAGAQSNwF-L9Irp-e7-Fuzj1doPZ9vjdfay9WCXQVJqFEqFYHMr9fOKRfWQA57AmioJasoFWewthS2io4",
            },
            logger: true,
            debug: true,
            secure: false,
        });

        const mailOptions = {
            from: "Cgram App",
            to: user.email,
            subject: "Password Reset",
            text: `Click on the following link to reset your password: http://37.32.6.230:3000/reset-password/${token}`,
        };

        try {
            console.log("befooooooooooore");
            await transporter.sendMail(mailOptions);
            console.log("afteeeeeeeeeeeeer")
            return {
                message: "Password reset link sent to your email account",
            };
        } catch (error) {
            
            throw new HttpError(500, "Error sending email");
        }
    }

    public async resetPassword(newPass: string, token: string) {
        let user;
        try {
            const decoded = jwt.verify(token, "10") as DecodedToken;
            user = await this.getUserByUsername(decoded.username);

            const dbtoken = await this.passwordResetTokenRepo.findByToken(
                token
            );

            if (!dbtoken) {
                throw new NotFoundError();
            }

            if (dbtoken.username !== user?.username) {
                throw new ForbiddenError();
            }

            if (dbtoken.expiration.getTime() < new Date().getTime()) {
                throw new ForbiddenError();
            }

            if (!user) {
                throw new NotFoundError();
            }
        } catch (error) {
            throw new HttpError(401, "Authentication failed.");
        }

        const password_hash = await hashGenerator(newPass);

        this.userRepo.updatePassword(user, password_hash);

        return { message: "New password set" };
    }

    public getEditProfile(user: User) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const response = {
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            profileStatus: user.profileStatus,
            bio: user.bio,
            profilePicture: user.profilePicture,
        };

        return response;
    }

    public async editProfile(
        username: string,
        password: string,
        picturePath: string,
        dto: EditProfileDto
    ): Promise<User> {
        const password_hash = dto.password
            ? await hashGenerator(dto.password)
            : password;

        await this.userRepo.updateProfile(username, {
            password: password_hash,
            email: dto.email,
            profilePicture: picturePath,
            firstName: dto.firstName,
            lastName: dto.lastName,
            profileStatus: dto.profileStatus,
            bio: dto.bio,
        });

        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }
        return user;
    }

    public getProfileInfo(user: User) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }

        const response = {
            username: user.username,
            firstname: user.firstName,
            lastname: user.lastName,
            bio: user.bio,
            profilePicture: user.profilePicture,
            posts: [],
            post_count: 0,
            follower_count: user.follower_count,
            following_count: user.following_count,
        };

        return response;
    }
}
