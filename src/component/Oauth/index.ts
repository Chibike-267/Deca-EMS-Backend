import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { Request } from "express";
import { ROLES, UserModel } from "../User/model";
import { v4 as uuid } from "uuid";
import { DATE } from "sequelize";

export interface Google {
  id: string;
  displayName: string;

  email: string;
  photos: [{ value: string }];
}

const strategy = GoogleStrategy.Strategy;
passport.use(
  new strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/google/callback",
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: Google,
      done: any
    ) => {
      try {
        const user = await UserModel.findOne({
          where: { googleId: profile.id, email: profile.email },
        });
        if (user) {
          done(null, profile);
          return;
        }
        const id = uuid();
        const savedUser = new UserModel({
          id,
          email: profile.email,
          firstName: "",
          lastName: "",
          fullName: profile.displayName,
          googleId: profile.id,
          role: "",
          phone: "",
          password: "",
          verificationOTP: "",
          expiresAt: 0,
          isVerified: false,
        });
        await savedUser.save();

        done(null, savedUser);
      } catch (error) {
        console.log(error);
        throw new Error(`${error}`);
      }
    }
  )
);

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});
passport.serializeUser((user, done) => {
  done(null, user);
});
