import express from "express";
import { signUp, signIn, logout } from "../services/auth.js";
// import Debug from "debug";

// const debug = Debug("my-memo-api:indexRoute");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.json({ message: "Express server running" });
});

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
