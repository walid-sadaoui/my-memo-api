// STRIPE API
// POST /v1/products CREATE PRODUCT
// GET /v1/products/:id GET S   PECIFIC PRODUCT
// POST /v1/products/:id UPDATE products
// GET /v1/products GET ALL PRODUCTS
// DELETE /v1/products/:id DELETED PRODUCT
import express from "express";
import Note from "../models/note.js";
import AppError from "../services/errorHandler.js";

const ROLE_ADMIN = "admin";
const router = express.Router();

router.get("/:id", async (req, res, next) => {
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

    const note = await Note.findOne({ id }, "_id description pinned").lean();
    if (!note) {
      throw new AppError("Notes Error", 409, "Note not found", true);
    }
    return res.status(200).send({
      data: {
        code: 200,
        message: `Note found!`,
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

    const note = await Note.remove({ id }).lean();
    console.log("Note delete : ", note);

    if (!note) {
      throw new AppError("Notes Error", 409, "Note not found", true);
    }

    return res.status(200).send({
      data: {
        code: 200,
        message: `Note successfully deleted!`,
        note,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
