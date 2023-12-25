import { Request, Response } from "express";
import {
  bcryptEncoded,
  forgotPasswordSchema,
  generatePasswordResetToken,
  loginUserSchema,
  option,
  registerUserSchema,
  resetPasswordSchema,
} from "../../utils/utils";

import { User, UserModel } from "./model";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendOTPVerificationEmail,
  sendResetOTP,
} from "../../lib/helper/sendVerificationEmail";

import { sendMail } from "../../lib/helper/sendMail";

import generateVerifcationOTP from "../../lib/helper/generateVerficationOTP";

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, password, confirm_password } = req.body;

    const validateResult = registerUserSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

    //Generate salt for password hash
    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt());

    //Check if user exist
    const user = await UserModel.findOne({
      where: { email: email },
    });
    if (user) {
      return res.status(201).json({ error: "Email already exist" });
    }

    const id = uuidv4();
    const OTP = generateVerifcationOTP();
    sendOTPVerificationEmail(email, OTP);
    const newuser = new UserModel({
      id,
      email,
      firstName,
      lastName,
      fullName: "",
      password: passwordHash,
      phone,
      googleId: "",
      role: "",
      verificationOTP: OTP,
      expiresAt: Date.now() + 5 * 60 * 1000,
      isVerified: false,
      resetPasswordExpiration: null,
      resetPasswordStatus: false,
      resetPasswordCode: "",
      loginCount: 0,
      loginRetrival: 0
    });

    console.log(newuser);

    const users = await newuser.save();
    return res
      .status(201)
      .json({ msg: "An OTP has been sent to your email", users });
  } catch (err) {
    console.log(err);
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validateResult = loginUserSchema.validate(req.body, option);

    if (validateResult.error) {
      res.status(400).json({ error: validateResult.error.details[0].message });
    }

    const User = (await UserModel.findOne({
      where: { email: email },
    })) as unknown as { [key: string]: string };

    if (!User) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }
    const { id } = User;

    const validUser = await bcrypt.compare(password, User.password);

    if (!validUser) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }
    if (!User.isVerified) {
      return res.status(400).json({ error: "verify your mail before login" });
    }

    const token = jwt.sign({ id: User.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      msg: "User login successful",
      User,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { OTP, email } = req.body;

    const user = (await UserModel.findOne({
      where: { email: email },
    })) as unknown as User;

    console.log(user, OTP);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verificationOTP !== OTP) {
      return res.status(400).json({
        error: "Invalid verification token",
      });
    }

    if ((user.expiresAt as number) < new Date().getTime()) {
      return res.status(400).json({
        error: "Verification token has expired",
      });
    }

    user.verificationOTP = "";
    user.isVerified = true;

    UserModel.update(
      {
        expiresAt: user.expiresAt,
        verificationOTP: user.verificationOTP,
        isVerified: true,
      },
      { where: { id: user.id } }
    );

    res.json({
      status: "SUCCESS",
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validationResult = forgotPasswordSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const email = req.body;

    const user = await UserModel.findOne({ where: email });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const OTP = generateVerifcationOTP();

    const recipient = user.dataValues.email;
    sendResetOTP(recipient, OTP);

    const userReset = await UserModel.update(
      {
        resetPasswordCode: OTP,
        resetPasswordStatus: true,
        resetPasswordExpiration: Date.now() + 600000,
      },
      { where: email }
    );

    return res
      .status(200)
      .json({ message: "password reset code has been sent to your mail" });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;
    const validation = resetPasswordSchema.validate(req.body, option);
    if (validation.error) {
      return res
        .status(400)
        .json({ error: validation.error.details[0].message });
    }
    const user = (await UserModel.findOne({
      where: { email },
    })) as unknown as User;
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (
      user.resetPasswordExpiration &&
      (user.resetPasswordExpiration as number) < new Date().getTime()
    ) {
      return res.status(400).json({ error: "OTP expired" });
    }
    const hash = await bcryptEncoded({ value: password });

    const userEmail = await UserModel.update(
      {
        password: hash,
        resetPasswordStatus: false,
        resetPasswordCode: null,
        resetPasswordExpiration: null,
      },
      { where: { id: user.id } }
    );
    if (!userEmail) {
      let info: { [key: string]: string } = {
        error: "user not found",
      };
      throw new Error(info.error);
    }

    return res.status(200).json({ message: "password reset successful" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const resendVerificationOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "user does not exits" });
    }
    const OTP = generateVerifcationOTP();
    sendOTPVerificationEmail(email, OTP);
    const userUpdate = await UserModel.update(
      {
        verificationOTP: OTP,
        expiresAt: Date.now() + 5 * 60 * 1000,
        isVerified: false,
      },
      { where: { email } }
    );

    return res
      .status(200)
      .json({ message: "new OTP has been sent to your mail" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
