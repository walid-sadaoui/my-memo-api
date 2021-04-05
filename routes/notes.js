import express from "express";
import Note from "../models/note.js";
import AppError from "../services/errorHandler.js";

const NOTE_FIELDS = "_id description pinned idUser createdAt updatedAt";
const router = express.Router();

router.get("/:id", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const note = await Note.findOne(
      { _id: id, idUser: _id },
      NOTE_FIELDS
    ).lean();

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

router.delete("/:id", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const note = await Note.remove({ _id: id, idUser: _id }).lean();

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

router.get("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const notes = await Note.find({ idUser: _id }, NOTE_FIELDS).lean();
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

router.post("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;
    const { description, pinned } = req.body;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    const newNote = new Note({
      description,
      pinned: pinned || false,
      idUser: _id,
    });
    const note = await newNote.save();
    const { __v, ...rest } = note.toObject();
    const noteFields = { ...rest };

    return res.status(200).send({
      data: {
        code: 200,
        message: `Note created!`,
        note: noteFields,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const { user } = req.session;
    const { _id } = user;
    const { description, pinned } = req.body;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Auth error", 400, "User is not logged in", true);
    }

    if ((!description || description === "") && !pinned) {
      throw new AppError(
        "Notes error",
        400,
        "Description or Pinned value must be provided",
        true
      );
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, idUser: _id },
      { description, pinned },
      { new: true, fields: NOTE_FIELDS }
    );

    if (!updatedNote) {
      throw new AppError("Notes Error", 404, "Note not found", true);
    }

    return res.status(200).send({
      data: {
        code: 200,
        message: `Note updated!`,
        note: updatedNote,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
