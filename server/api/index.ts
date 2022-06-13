import express, { Request, Response } from "express";
import routes from "./routes";

export const startServer = () => {
  const app = express();
  const port = 8080;
  app.use(express.json());
  app.use(routes);
  app.listen(port, () => {
    console.log(`Listening to requests on port: ${port}`);
  });
};
