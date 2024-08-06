import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { Express } from "express";
import request from "supertest";

describe("User route test suite", () => {
    let app: Express;

    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = makeApp(dataSource);
    });

    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });

    describe("Signing up", () => {
        it("should create a user in database upon signup", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(200);
        });

        it("should fail if username or password are already in use", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(403);
        });

        it("should fail if a field is not provided", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(400);
        });
    });

    describe("Signing in", () => {
        it("should sign in with valid username", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should sign in with valid email", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should fail to login if username is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "testwrong", password: "test" })
                .expect(401);
        });

        it("should fail to login if email is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "testwrong@gmail.com", password: "test" })
                .expect(401);
        });

        it("should fail to login if password is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "test", password: "testwrong" })
                .expect(401);
        });

        it("should fail if username or password in empty", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "", password: "test" })
                .expect(400);
        });
    });

    describe("Forget password", () => {
        it("should send forget email", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "mmff",
                    email: "mrmahdifardi@gmail.com",
                    password: "test",
                })
                .expect(200);

            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "mrmahdifardi@gmail.com" })
                .expect(200);
        });

        it("should fail if credential is empty", async () => {
            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "" })
                .expect(400);
        });

        it("should fail if credential is valid", async () => {
            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "notvalid" })
                .expect(401);
        });
    });
});
