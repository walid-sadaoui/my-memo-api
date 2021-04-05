import express from "express";
import Note from "../models/note.js";
import AppError from "../services/errorHandler.js";

const ROLE_ADMIN = "admin";
const NOTE_FIELDS = "_id description pinned idUser createdAt updatedAt";
const router = express.Router();

router.get("/notes/:id", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    if (user.role !== ROLE_ADMIN) {
      throw new AppError(
        "Permission error",
        403,
        "User do not have the premission needed to do this action",
        true
      );
    }

    const note = await Note.findOne({ _id: id }, NOTE_FIELDS).lean();
    if (!note) {
      throw new AppError("Notes Error", 404, "Note not found", true);
    }

    return res.status(200).send({
      data: {
        code: 200,
        message: `Note found !`,
        note,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/notes/:id", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    if (user.role !== ROLE_ADMIN) {
      throw new AppError(
        "Permission error",
        403,
        "User do not have the premission needed to do this action",
        true
      );
    }

    const note = await Note.remove({ _id: id }).lean();

    if (note.deletedCount === 0) {
      throw new AppError("Note Deletion Error", 404, "Note not found", true);
    }

    return res.status(204).send({
      data: {
        code: 204,
        message: `Note successfully deleted !`,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/notes", async (req, res, next) => {
  try {
    const { user } = req.session;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    if (user.role !== ROLE_ADMIN) {
      throw new AppError(
        "Permission error",
        403,
        "You do not have the permission needed to do this action",
        true
      );
    }

    const notes = await Note.find({}, NOTE_FIELDS).lean();
    if (notes.length === 0) {
      throw new AppError("Notes Error", 404, "No note found", true);
    }

    return res.status(200).send({
      data: {
        code: 200,
        message: `${notes.length} Note(s) found!`,
        notes,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
