import User from "../models/user.model";
import Code from "../models/code.model";
import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccountKey.json";
import bcrypt from "bcryptjs";
import express from "express";
import sms from "../utils/sms/sms";
const app = express();
import bodyParserr from "body-parser";
app.use(express.json());
import GENERATE_TOKENN from "../utils/token/token";
import { Request, Response } from "express";

app.use(
  bodyParserr.urlencoded({
    extended: true,
  })
);
app.use(bodyParserr.json());

app.use(express.urlencoded({ extended: true }));

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const signInUser = async (info: any, callback: Function) => {
  try {
    const user = await admin.auth().getUserByEmail(info.email);
    callback(null, user);
  } catch (error) {
    callback(error);
  }
};

const signUpUser = async (info: any, callback: Function) => {
  try {
    const user = await admin.auth().createUser({
      email: info.email,
      password: info.password,
      displayName: info.firstName + " " + info.lastName,
    });
    callback(null, user);
  } catch (error) {
    callback(error);
  }
};


const signOutUser = async (info: any, callback: Function) => {
  try {
    const user = await admin.auth().getUserByEmail(info.email);
    callback(null, user);
  } catch (error) {
    callback(error);
  }
};

const SIGNUP = async (req: any, res: any) => {
  const { firstName, lastName, email, password } = req.body;
  const info = { firstName, lastName, email, password };
  bcrypt.hash(password, 10, (err: any, hash: any) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      signUpUser(info, async (error: any, user: any) => {
        if (error) {
          res.status(400).json({ error });
        } else {
          const newUser = new User({
            firstName,
            lastName,
            email,
            userName: null,
            profilePicture: null,
            bio: null,
            password: hash,
            phoneVerified: false,
            role: "user",
          });
          await newUser.save();
          res.status(200).json({ user });
        }
      });
    }
  });
};



const SIGNIN = async (req: any, res: any) => {
  const { email, password } = req.body;
  const info = { email, password };
  // Find user by email and compare password with hashed password
  User.findOne({ email }).then((dbuser: any) => {
    if (!dbuser) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    } else {
      bcrypt.compare(password, dbuser.password).then((isMatch: any) => {
        if (isMatch) {
          signInUser(info, async (error: any, user: any) => {
            if (error) {
              res.status(400).json({ error });
            } else {
              const { access_token, refresh_token } = GENERATE_TOKENN(dbuser);
              // update token in user
              await User.findByIdAndUpdate(
                dbuser._id,
                { token: refresh_token },
                { new: true }
              );

              // add refresh token to cookie
              res.cookie("refresh_token", refresh_token, {
                httpOnly: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
                secure: true,
              });
              const { token, ...userData } = dbuser._doc;
              userData.access_token = access_token; // add access token to
              res.status(200).json({ user, userData });
            }
          });
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    }
  });
  console.log(req.user);
};

const SIGNOUT = async (req: any, res: any) => {
  const { email } = req.body;
  const info = { email };
  signOutUser(info, (error: any, user: any) => {
    if (error) {
      res.status(400).json({ error });
    } else {
      res.status(200).json({ user });
    }
  });
};

//collect the phone number from the user and send a code to the user
const SEND_SMS = async (req: any, res: any) => {
  Code.findOne({ phoneNumber: req.body.phone }, (err: any, code: any) => {
    if (code) {
      res
        .status(400)
        .json({ error: "Code already sent! Try again using the resend route" });
    }
  });
  const { phone } = req.body;
  //remove the first 0 from the phone number
  const phoneNumber = phone.substring(1);
  // //add the country code
  const number = "233" + phoneNumber;
  //generate a random 6 digit number
  const code = Math.floor(100000 + Math.random() * 900000);
  //send the code to the user
  sms(number, "Your verification code is :" + code);
  //save the code to the database
  const newCode = new Code({
    code,
    phoneNumber: phone,
    user: req.user.id,
  });
  newCode.save();
  res.status(200).json({ code });
};

//verify the code sent to the user
const VERIFY_CODE = async (req: Request, res: Response) => {
  const code = req.body.code;
  console.log(code);
  Code.findOne({ user: req.user.id }).then((dbcode: any) => {
    console.log(dbcode);
    console.log(dbcode.code);
    console.log(req.user.id);
    if (!dbcode) {
      return res.status(404).json({ codenotfound: "Code not found" });
    } else {
      if (dbcode.code == code) {
        User.findByIdAndUpdate(
          req.user.id,
          { phoneVerified: true },
          { new: true }
        ).then((dbuser: any) => {
          res.status(200).json({ user: dbuser });
        });
      } else {
        res.status(400).json({ codeincorrect: "Code incorrect" });
      }
    }
  });
};

//resend the a new code to the user
const RESEND_CODE = async (req: any, res: any) => {
  Code.findOne({ user: req.user.id }).then((dbcode: any) => {
    if (!dbcode) {
      return res.status(404).json({ codenotfound: "Code not found" });
    } else {
      const { phoneNumber } = dbcode;
      const phone = phoneNumber.substring(1);
      const number = "233" + phone;
      const code = Math.floor(100000 + Math.random() * 900000);
      sms(number, "Your verification code is :" + code);
      Code.findOneAndUpdate(
        { user: req.user.id },
        { $set: { code } },
        { new: true }
      )
        .then((doc: any) => {
          res.status(200).json({ doc });
        })
        .catch((err: any) => {
          console.log("Something wrong when updating data!");
        });
    }
  });
};

const UPDATE_USER_INFO = async (req: any, res: any) => {
  const { userName, bio, profilePicture } = req.body;
  User.findOneAndUpdate(
    { _id: req.user.id },
    { $set: { userName, bio, profilePicture } },
    { new: true }
  )
    .then((doc: any) => {
      res.status(200).json({ doc });
    })
    .catch((err: any) => {
      console.log("Something wrong when updating data!");
    });
};

// get the logged in user details
const GET_USER_DETAILS = async (req: any, res: any) => {
  User.findOne({ _id: req.user.id }).then((dbuser: any) => {
    if (!dbuser) {
      return res.status(404).json({ usernotfound: "User not found" });
    } else {
      res.status(200).json({ dbuser });
    }
  });
};

export {
  SIGNUP,
  SIGNIN,
  SIGNOUT,
  SEND_SMS,
  VERIFY_CODE,
  RESEND_CODE,
  UPDATE_USER_INFO,
  GET_USER_DETAILS,
};
