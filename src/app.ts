import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "../src/component/Oauth/index";
import session from "express-session";
import logger from "morgan";
import passport from "passport";
import { AuthMiddleware } from "./lib/middleware";
import bcrypt from "bcryptjs";
import { User, UserModel } from "./component/User/model";
import nodemailer from "nodemailer";
import { sendOTPVerificationEmail } from "./lib/helper/sendVerificationEmail";
import generateVerifcationOTP from "./lib/helper/generateVerficationOTP";
import { v4 as uuid } from "uuid";
import router from "./routes";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.PASSPORT_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());

app.use(router);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/failure",
  })
);
app.get("/auth/failure", (req, res) => {
  res.send("something went wrong...");
});

app.get(
  "/protected",
  AuthMiddleware.Authenticate(["employee"]),
  (req: Request, res: Response) => {
    res.send("Hello!");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      throw new Error(err);
    }
  });
  req.session.destroy(() => {
    res.send("Goodbye");
  });
});

export default app;
