import cors from "cors";
require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
const app = express();
import bodyParser from "body-parser";
import errrorHandler from "./middleware/errorHandler";
import { Request, Response, NextFunction } from "express";
const PORT = process.env.PORT || 5000;
import DB_CONNECT from "./config/dbconnect";

//import routes
import userRoutes from "./routes/user";

//global middlewares
app.use(errrorHandler);
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//use body parser middleware
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path + " " + req.method);
  next();
});

//use routes
app.use("api/v1/auth", userRoutes);

// Connect to MongoDB

//if NODE_ENV is test, don't connect to database
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    try {
      await DB_CONNECT();
      console.log(`server listening on Port ${PORT}`);
    } catch (err) {
      console.log(err);
    }
  });
} else {
  console.log("Test environment");
}

//export app for testing
export default app;
