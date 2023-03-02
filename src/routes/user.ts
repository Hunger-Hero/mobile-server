import { verifyAccessToken } from "../middleware/verification";

import express from "express";

const router = express.Router();

import {
  SIGNUP,
  GET_USER_DETAILS,
  RESEND_CODE,
  SEND_SMS,
  SIGNIN,
  SIGNOUT,
  UPDATE_USER_INFO,
  VERIFY_CODE,
} from "../controllers/user.controller";

router.post("/signup", SIGNUP);

router.post("/signin", SIGNIN);

router.post("/signout", verifyAccessToken, SIGNOUT);

router.post("/send-sms", verifyAccessToken, SEND_SMS);

router.post("/verify-code", verifyAccessToken, VERIFY_CODE);

router.post("/resend-code", verifyAccessToken, RESEND_CODE);

router.post("/user-info", verifyAccessToken, UPDATE_USER_INFO);

router.get("/user", verifyAccessToken, GET_USER_DETAILS);


export default router;
