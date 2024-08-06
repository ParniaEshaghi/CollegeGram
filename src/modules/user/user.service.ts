import { HttpError, NotFoundError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import { User } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
import nodemailer from "nodemailer";
import { PasswordResetTokenRepository } from "./forgetPassword.repository";
import { ForgetPassword } from "./model/forgetPassword.model";

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

        const user = success ? await this.getUserByEmail(dto.credential) : await this.getUserByUsername(dto.credential);

        // if (success) {
        //     const user = await this.getUserByEmail(dto.credential);
        // } else {
        //     const user = await this.getUserByUsername(dto.credential);
        // }

        if (!user) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!user || !match) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const expiry = dto.keepMeSignedIn ? '7d' : '8h';

        const token = jwt.sign(
            { username: user.username },
            "10",
            { expiresIn: expiry }
        );

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
            auth: {
                user: "cgramcgram421@gmail.com",
                pass: "jbjhrygcpwxupldx",
            },
        });

        const mailOptions = {
            from: "Cgram App",
            to: user.email,
            subject: "Password Reset",
            text: `Click on the following link to reset your password: http://localhost:3000/reset-password/${token}`,
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
}
