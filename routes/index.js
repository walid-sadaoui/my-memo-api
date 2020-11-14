import express from "express";
import { signUp } from "../services/auth.js";
import Debug from "debug";

const debug = Debug("my-memo-api:indexRoute");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

/* POST signup */
router.post("/signup", (req, res) => {
  debug("Index route signup");
  signUp(req, res);
});

// parameter match
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
// });

// router.route('/')
//   .get();
export default router;
