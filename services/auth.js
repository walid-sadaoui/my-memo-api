import argon2 from "argon2-ffi";
import crypto from "crypto";
import Promise from "bluebird";
import Debug from "debug";
import Joi from "joi";
import User from "../models/user.js";
import AppError from "./errorHandler.js";

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
  return argon2i.verify(encodedHash, password);
};

const validatePassword = (password) => {
  const passwordSchema = Joi.string()
    .regex(/[0-9]/)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[-! \"#$%&'()*+,./:;<=>?@[^_`{|}~\]]/)
    .min(8)
    .max(26)
    .required();
  const { error } = passwordSchema.validate(password);
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

const signUp = async (username, email, password) => {
  try {
    if (!email || !password) {
      throw new AppError(
        "Auth error",
        400,
        "Email and Password are required",
        true
      );
    }

    if (!validatePassword(password)) {
      throw new AppError(
        "Auth error",
        422,
        "Invalid password format : password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character and at most 26 characters",
        true
      );
    }

    if (!validateEmail(email)) {
      throw new AppError("Auth error", 422, "Invalid email format", true);
    }

    const emailExist = await User.findOne({ email }).lean();
    if (emailExist) {
      throw new AppError("Auth error", 409, "Email already exists", true);
    }

    const filledUsername = fillUsername(username, email);
    if (!validateUsername(filledUsername)) {
      throw new AppError(
        "Auth error",
        422,
        "Invalid username format : username must contain at least 3 characters.",
        true
      );
    }

    const usernameExist = await User.findOne({ username }).lean();
    if (usernameExist) {
      throw new AppError("Auth error", 409, "Username already exists", true);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username: filledUsername,
      email,
      password: hashedPassword,
    });
    const userSignedUp = await newUser.save();

    const { password: userPassword, __v, ...rest } = userSignedUp;
    const userInfo = { ...rest };

    return userInfo;
  } catch (error) {
    throw new AppError(
      "Auth error",
      error.httpCode || 500,
      error.description || "There was a problem logging into your account",
      true
    );
  }
};

const logIn = async (email, password) => {
  try {
    if (!email || !password) {
      throw new AppError(
        "Auth error",
        400,
        "Email and Password are required",
        true
      );
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      throw new AppError("Auth error", 409, "Invalid credentials", true);
    }

    const passwordValid = await verifyPassword(user.password, password);
    if (!passwordValid) {
      throw new AppError("Auth error", 409, "Invalid credentials", true);
    }

    const { password: userPassword, __v, ...rest } = user;
    const userInfo = { ...rest };

    return userInfo;
  } catch (error) {
    throw new AppError(
      "Auth error",
      error.httpCode || 500,
      error.description || "There was a problem logging into your account",
      true
    );
  }
};

export { signUp, logIn, hashPassword, verifyPassword, validatePassword };
