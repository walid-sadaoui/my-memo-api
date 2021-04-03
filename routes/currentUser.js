import express from "express";
import Note from "../models/note.js";
import AppError from "../services/errorHandler.js";

const router = express.Router();

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
          id: _id,
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

/* GET user notes. */
router.get("/notes", async (req, res, next) => {
  try {
    const { user } = req.session;
    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const { _id: idUser, username } = user;
    const userNotes = await Note.find(
      { idUser },
      "_id description pinned"
    ).lean();
    if (userNotes.length === 0) {
      throw new AppError(
        "Notes Error",
        409,
        "No notes found for this user",
        true
      );
    }
    return res.status(200).send({
      data: {
        code: 200,
        message: `Notes of ${username} found!`,
        notes: userNotes,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
