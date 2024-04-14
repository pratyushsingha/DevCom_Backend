import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(`error connecting to the database: ${err}`);
  }
};

connectDB()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.log(`error connecting to database ${err}`);
    process.exit(1);
  });
