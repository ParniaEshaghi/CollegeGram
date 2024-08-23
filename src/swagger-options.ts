import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Collegegram API documentation",
            version: "1.0.0",
            description: "API description",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
            {
                url: "http://37.32.6.230",
            },
            {
                url: "http://collegegram.outofmatrixxx.ir",
            },
        ],
    },
    apis: ["./src/docs/*.ts"],
};

export default swaggerJsDoc(swaggerOptions);
