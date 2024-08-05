import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { Express } from "express";
import request from "supertest";


describe('User route test suite', () => {
    let app: Express;

    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = makeApp(dataSource);
    });

    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });

    describe('Signing up', () => {
        it("should create a user in database upon signup", async () => {
            const user = await request(app).post("/user/signup").send({ username: "test", email: "test@gmail.com", password: "test" }).expect(200);
            console.log(user)
        });

        it("should fail if username or password are already in use", async () => {
            const user = await request(app).post("/user/signup").send({ username: "test", email: "test@gmail.com", password: "test" }).expect(403);
        });

        it("should fail if a field is not provided", async () => {
            const user = await request(app).post("/user/signup").send({ username: "", email: "test@gmail.com", password: "test" }).expect(400);
        });
    });
});