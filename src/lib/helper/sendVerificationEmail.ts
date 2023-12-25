import nodemailer from "nodemailer";

const MAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
};

export const sendOTPVerificationEmail = async (email: string, otp: string) => {
  try {
    console.log(email, otp, process.env.AUTH_EMAIL);
    // Create a transporter
    const transporter = nodemailer.createTransport({
      ...MAIL_CONFIG,
    });

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<p>Enter <b>${otp}</b> to verify your email...</p><p>This code expires in 5 minutes</p>`,
    };

    let info = await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const sendResetOTP = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      ...MAIL_CONFIG,
    });

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Reset Password OTP",
      html: `<p>Enter <b>${otp}</b> to reset your password...</p><p>This code expires in 5 minutes</p>`,
    };

    let info = await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// export default sendOTPVerificationEmail;

export default sendOTPVerificationEmail;
