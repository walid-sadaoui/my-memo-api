import express from "express";
import { signUp, logIn } from "../services/auth.js";
import AppError from "../services/errorHandler.js";

const router = express.Router();

/* Verify express running */
router.get("/", (req, res) => {
  res.json({ message: "Express server running" });
});

router.post("/signup", async (req, res, next) => {
  try {
    const { user } = req.session;
    if (user) {
      throw new AppError(
        "Auth error",
        400,
        "A User is already logged in",
        true
      );
    }

    const { username, email, password } = req.body;
    const userSignedUp = await signUp(username, email, password);

    return res.status(200).json({
      data: {
        code: 200,
        message: "User signed in!",
        user: userSignedUp,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { user } = req.session;
    if (user) {
      throw new AppError("Auth error", 400, "User already logged in", true);
    }

    const { email, password } = req.body;
    const userLoggedIn = await logIn(email, password);

    req.session.user = userLoggedIn;

    return res.status(200).json({
      data: {
        code: 200,
        message: "User signed in!",
        user: userLoggedIn,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res, next) => {
  try {
    const { user } = req.session;
    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    req.session.destroy((error) => {
      if (error) {
        throw new AppError("Auth error", 500, error, true);
      }
    });

    return res.status(204).json({
      data: {
        message: "Logout successful",
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
