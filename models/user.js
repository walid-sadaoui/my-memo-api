import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: [true, "This Username is already used"],
    },
    email: {
      type: String,
      required: [true, "The Email is required"],
      unique: [true, "This Email is already used"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

// eslint-disable-next-line
userSchema.pre("save", function (next) {
  const email = this.get("email");
  const username = this.get("username");
  if (username === undefined) {
    this.set("username", email);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
