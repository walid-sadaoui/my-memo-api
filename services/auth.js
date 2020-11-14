import argon2 from "argon2-ffi";
import crypto from "crypto";
import Promise from "bluebird";
import Debug from "debug";
import Joi from "joi";
import User from "../models/user.js";

const debug = Debug("my-memo-api:auth-service");

const { argon2i } = argon2;
const randomBytes = Promise.promisify(crypto.randomBytes);

const hashPassword = async (password) => {
  try {
    return randomBytes(32).then((salt) => argon2i.hash(password, salt));
  } catch (error) {
    debug(error);
    throw error;
  }
};

const verifyPassword = (encodedHash, password) => {
  argon2i
    .verify(encodedHash, password)
    .then((correct) =>
      debug(correct ? "Correct password!" : "Incorrect password")
    );
};

const validatePassword = (password) => {
  const signUpSchema = Joi.string()
    .regex(/[0-9]/)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[-! \"#$%&'()*+,./:;<=>?@[^_`{|}~\]]/)
    .min(8)
    .max(26)
    .required();
  const { error } = signUpSchema.validate(password);
  if (error) {
    return false;
  }
  return true;
};

const validateEmail = (email) => {
  const emailSchema = Joi.string().email({ tlds: false }).required();
  const { error } = emailSchema.validate(email);
  if (error) {
    return false;
  }
  return true;
};

const validateUsername = (username) => {
  const usernameSchema = Joi.string().min(3).required();
  const { error } = usernameSchema.validate(username);
  if (error) {
    return false;
  }
  return true;
};

const fillUsername = (username, email) => {
  let filledUsername = username;
  if (username === "" || username === undefined) {
    filledUsername = email;
  }
  return filledUsername;
};

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Invalid password format : password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character and at most 26 characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const emailExist = await User.findOne({ email }).lean();
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const filledUsername = fillUsername(username, email);

    if (!validateUsername(filledUsername)) {
      return res.status(400).json({
        message:
          "Invalid username format : username must contain at least 3 characters.",
      });
    }

    const usernameExist = await User.findOne({ username }).lean();
    if (usernameExist) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username: filledUsername,
      email,
      password: hashedPassword,
    });

    const { username: savedUsername, email: savedEmail } = await newUser.save();

    return res.status(200).json({
      message: "User created!",
      savedUsername,
      savedEmail,
    });
  } catch (error) {
    return res.status(400).json({
      message: "There was a problem creating your account",
      error,
    });
  }
};

export { signUp, hashPassword, verifyPassword, validatePassword };
