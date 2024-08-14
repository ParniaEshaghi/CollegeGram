import { HttpError } from "../../utility/http-errors";
import { SendMailDto } from "./dto/sendEmail.dto";
import nodemailer from "nodemailer";

export class EmailService {
    private transporter = nodemailer.createTransport({
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

    constructor() {}

    public async sendEmail(dto: SendMailDto) {
        const mailOptions = {
            from: "Cgram App",
            to: dto.reciever,
            subject: dto.subject,
            text: dto.text,
        }

        try {
            await this.transporter.sendMail(mailOptions);
            return {
                message: "Email successfully sent",
            };
        } catch (error) {
            throw new HttpError(500, "Error sending email");
        }
    }
}
