import express from "express";
import User from "../models/user.js";
import AppError from "../services/errorHandler.js";

const router = express.Router();
const USER_FIELDS = "_id username  email createdAt updatedAt";

/* GET current user. */
router.get("/", (req, res, next) => {
  try {
    const { user } = req.session;
    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const { _id, username, email, createdAt, updatedAt } = user;
    return res.status(200).send({
      data: {
        code: 200,
        message: "Authenticated user found !",
        user: {
          _id,
          username,
          email,
          createdAt,
          updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

/* GET current user. */
router.patch("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;
    const { username, email, password } = req.body;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id },
      { username, email, password },
      { new: true, fields: USER_FIELDS }
    );

    return res.status(200).send({
      data: {
        code: 200,
        message: "User informations updated !",
        user: updatedUser,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
