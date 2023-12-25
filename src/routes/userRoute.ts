import express from "express";
import {
  Register,
  forgotPassword,
  resetPassword,
  verifyOTP,
} from "../component/User/userController";

const router = express.Router();

router.post("/register", Register);
router.post("/verify", verifyOTP);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

export default router;
