import { Router } from "express";
import {
  Register,
  verifyOTP,
  forgotPassword,
  resetPassword,
  Login,
  resendVerificationOtp,
} from "./userController";

const router = Router();

router.post("/register", Register);
router.post("/verify", verifyOTP);
router.post("/login", Login);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/resend_Otp", resendVerificationOtp);

export default router;
