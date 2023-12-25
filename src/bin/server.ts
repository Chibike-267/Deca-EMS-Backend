import dotenv from "dotenv";

dotenv.config();
import { createServer } from "http";
import app from "../app";
import sequelize from "../db";

const port = process.env.PORT ?? 5000;

const server = createServer(app);

sequelize.sync().then(() => console.log("database connected successfully"));
app.listen(port, () => {
  console.log(`server is live on http://localhost:${port}`);
});
