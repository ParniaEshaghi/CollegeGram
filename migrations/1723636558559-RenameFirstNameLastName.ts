import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFirstNameLastName1723636558559 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Posts table
        await queryRunner.query(`
        CREATE TABLE "Posts" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "images" character varying array NOT NULL,
            "caption" character varying NOT NULL,
            "tags" character varying array NOT NULL,
            "mentions" character varying array NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP,
            "userId" uuid,
            CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id")
        )
    `);

        // Create userRelations table
        await queryRunner.query(`
        CREATE TABLE "userRelations" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP,
            "followerId" uuid,
            "followingId" uuid,
            CONSTRAINT "PK_05ccbaf03543dae189765f4bbe4" PRIMARY KEY ("id")
        )
    `);

        // Rename columns instead of dropping them
        await queryRunner.renameColumn("users", "firstName", "firstname");
        await queryRunner.renameColumn("users", "lastName", "lastname");

        // Add new columns with correct naming
        await queryRunner.query(
            `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "passwordRestTokens" ADD "username" character`
        );
        await queryRunner.query(
            `ALTER TABLE "passwordRestTokens" ADD "deletedAt" TIMESTAMP`
        );

        // Add foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "Posts" ADD CONSTRAINT "FK_a8237eded7a9a311081b65ed0b8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "userRelations" ADD CONSTRAINT "FK_167298870166d6d6c437cdd3427" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "userRelations" ADD CONSTRAINT "FK_a6216b769192f391908dce3bdb0" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "userRelations" DROP CONSTRAINT "FK_a6216b769192f391908dce3bdb0"`
        );
        await queryRunner.query(
            `ALTER TABLE "userRelations" DROP CONSTRAINT "FK_167298870166d6d6c437cdd3427"`
        );
        await queryRunner.query(
            `ALTER TABLE "Posts" DROP CONSTRAINT "FK_a8237eded7a9a311081b65ed0b8"`
        );

        // Remove added columns
        await queryRunner.query(
            `ALTER TABLE "passwordRestTokens" DROP COLUMN "deletedAt"`
        );
        await queryRunner.query(
            `ALTER TABLE "passwordRestTokens" DROP COLUMN "username"`
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);

        // Rename columns back to original
        await queryRunner.renameColumn("users", "lastname", "lastName");
        await queryRunner.renameColumn("users", "firstname", "firstName");

        // Drop the created tables
        await queryRunner.query(`DROP TABLE "userRelations"`);
        await queryRunner.query(`DROP TABLE "Posts"`);
    }
}
