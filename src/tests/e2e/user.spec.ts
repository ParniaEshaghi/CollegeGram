import { makeApp } from "../../api";
import { AppDataSource } from "../../data-source";
import { Express } from "express";
import request from "supertest";
import { hashGenerator } from "../../utility/hash-generator";
import bcrypt from "bcrypt";

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
    describe("Signing in", () => {
        it("should sign in with valid username", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
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
                
                .send({  credential: "", password: "test" })
                
                .expect(400);
        });
    });

    describe("Forget password", () => {
        // it works
        it.skip("should send forget email", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "parnia",
                    email: "parniaeshaghi@gmail.com",
                    password: "parnia",
                })
                .expect(200);

            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "parniaeshaghi@gmail.com" })
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

    describe("Reset password", () => {
        //TODO: find a way to test the token
        it("should reset password", async () => {});

        it("should fail if token is wrong or expired", async () => {
            await request(app)
                .post("/user/resetpassword")
                .send({ newPass: "newPass", token: "wrong token" });
        });
    });

    describe("get edit profile", () => {
        it("should login and get edit progile page", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
                .set("Cookie", [cookie]);
            expect(response_getEdit_profile.status).toBe(200);

            expect(response_getEdit_profile.body).toHaveProperty("firstname");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app).get(
                "/user/geteditprofile"
            );
            expect(response_getEdit_profile.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_getEdit_profile.status).toBe(401);
        });
    });

    describe("get profile info", () => {
        it("should login and get profile info page", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/user/profileInfo")
                .set("Cookie", [cookie]);
            expect(response_profile_info.status).toBe(200);

            expect(response_profile_info.body).toHaveProperty("follower_count");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app).get(
                "/user/profileInfo"
            );
            expect(response_profile_info.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/user/profileInfo")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_profile_info.status).toBe(401);
        });
    });

    describe("Forget password", () => {
        // it works
        it.skip("should send forget email", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "parnia",
                    email: "parniaeshaghi@gmail.com",
                    password: "parnia",
                })
                .expect(200);

            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "parniaeshaghi@gmail.com" })
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

    describe("Reset password", () => {
        //TODO: find a way to test the token
        it("should reset password", async () => {});

        it("should fail if token is wrong or expired", async () => {
            await request(app)
                .post("/user/resetpassword")
                .send({ newPass: "newPass", token: "wrong token" });
        });
    });

    describe("get edit profile", () => {
        it("should login and get edit progile page", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
                .set("Cookie", [cookie]);
            expect(response_getEdit_profile.status).toBe(200);

            expect(response_getEdit_profile.body).toHaveProperty("firstname");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app).get(
                "/user/geteditprofile"
            );
            expect(response_getEdit_profile.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_getEdit_profile.status).toBe(401);
        });
    });

    describe("Editing Profile", () => {
        it("should update profile", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            const hashed_password = await hashGenerator("test")
            const response_editprofile = await request(app)
                .post("/user/editprofile")
                .set("Cookie", [cookie])
                .send({
                        password: "newpass",
                        email: "changedemail@gmail.com",
                        firstName: "test",
                        lastName: "test",
                        profileStatus: "private",
                        bio: "test", 
                }).expect(200);

            expect(response_editprofile.body.email).toBe("changedemail@gmail.com");
            expect(response_editprofile.body.firstName).toBe("test");
            expect(response_editprofile.body.profileStatus).toBe("private")
            expect(
                await bcrypt.compare("newpass", response_editprofile.body.password)
            ).toBe(true);

        });

        it("should fail to update profile if cookie token is not valid", async () => {
            await request(app)
                .post("/user/editprofile")
                .set("Cookie", ["wrong cookie"])
                .send({
                        password: "newpass",
                        email: "changedemail@gmail.com",
                        firstName: "test",
                        lastName: "test",
                        profileStatus: "private",
                        bio: "test", 
                }).expect(401);
        });
    });
});
