import express from "express";
// import Debug from "debug";
import { signUp, signIn, logout } from "../services/auth.js";
// import User from "../models/user.js";

// const debug = Debug("my-memo-api:indexRoute");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.json({ message: "Express server running" });
});

// /* GET session. */
// router.get("/session", (req, res) => {
//   const { userId } = req.session;
//   debug("Session : ", req.session);
//   debug("UserId : ", userId);
//   res.json({ message: "Express server running" });
// });

// /* GET me. */
// router.get("/me", async (req, res) => {
//   const { userId } = req.session;
//   debug(userId);
//   const user = await User.findById(userId);
//   res.json({ message: "Express server running" });
// });

/* POST signup */
router.post("/signup", (req, res) => {
  signUp(req, res);
});

/* POST signin */
router.post("/signin", (req, res) => {
  signIn(req, res);
});

/* POST logout */
router.post("/logout", (req, res) => {
  logout(req, res);
});

export default router;
