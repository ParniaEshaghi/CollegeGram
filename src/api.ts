import { DataSource } from "typeorm";
import express from "express";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  return app;
};
