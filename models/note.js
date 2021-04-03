import mongoose from "mongoose";

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    description: {
      type: String,
    },
    pinned: {
      type: Boolean,
    },
    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
