import { DataSource, Repository } from "typeorm";
import { PasswordResetTokenEntity } from "./entity/forgetPassword.entity";
import { ForgetPassword } from "./model/forgetPassword.model";

export class PasswordResetTokenRepository {
    private passwordResetTokenRepo: Repository<PasswordResetTokenEntity>;

    constructor(appDataSource: DataSource) {
        this.passwordResetTokenRepo = appDataSource.getRepository(
            PasswordResetTokenEntity
        );
    }

    public create(forgetPassword: ForgetPassword): Promise<ForgetPassword> {
        return this.passwordResetTokenRepo.save(forgetPassword);
    }

    public findByToken(token: string): Promise<ForgetPassword | null> {
        return this.passwordResetTokenRepo.findOne({
            where: { token },
        });
    }
}
