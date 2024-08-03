import { makeApp } from "./api";
import { AppDataSource } from "./data-source";

const PORT = 3000;

AppDataSource.initialize().then((dataSource) => {
  const app = makeApp(dataSource);
  app.listen(PORT, () => {
    console.log("listening on Port " + PORT);
  });
});
