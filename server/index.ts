import { startServer } from "./api";
import { connectDb } from "./db";

const main = () => {
  //Connect to db
  connectDb();
  // Start server
  startServer();
};

main();
