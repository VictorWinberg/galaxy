import { Client } from "ts-postgres";

export const connectDb = async () => {
  console.log("Connecting to db");
  const client = new Client({
    port: 5432,
    user: "postgres",
    password: "postgres",
    host: "localhost",
  });
  await client.connect();
};
