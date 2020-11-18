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

const signUp = async (req, res) => {
  try {
    const { userId } = req.session;

    if (userId) {
      return res.status(400).json({
        code: 400,
        message: "A User is already logged in",
      });
    }

    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: "Email and Password are required",
      });
    }

    if (!validatePassword(password)) {
      return res.status(422).json({
        code: 422,
        message:
          "Invalid password format : password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character and at most 26 characters",
      });
    }

    if (!validateEmail(email)) {
      return res
        .status(422)
        .json({ code: 422, message: "Invalid email format" });
    }

    const emailExist = await User.findOne({ email }).lean();
    if (emailExist) {
      return res
        .status(409)
        .json({ code: 409, message: "Email already exists" });
    }

    const filledUsername = fillUsername(username, email);

    if (!validateUsername(filledUsername)) {
      return res.status(422).json({
        code: 422,
        message:
          "Invalid username format : username must contain at least 3 characters.",
      });
    }

    const usernameExist = await User.findOne({ username }).lean();
    if (usernameExist) {
      return res.status(409).json({
        code: 409,
        message: "Username already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username: filledUsername,
      email,
      password: hashedPassword,
    });

    const {
      _id: newUserId,
      username: newUsername,
      email: newEmail,
      createdAt,
      updatedAt,
    } = await newUser.save();

    return res.status(200).json({
      code: 200,
      message: "User created!",
      user: {
        id: newUserId,
        username: newUsername,
        email: newEmail,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "There was a problem creating your account",
      error,
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { user } = req.session;

    if (user) {
      return res.status(400).json({
        code: 400,
        message: "User already logged in",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: "Email and Password are required",
      });
    }

    const userByEmail = await User.findOne({ email }).lean();
    if (!userByEmail) {
      return res
        .status(409)
        .json({ code: 409, message: "Invalid credentials" });
    }

    const passwordValid = await verifyPassword(userByEmail.password, password);

    if (!passwordValid) {
      return res
        .status(409)
        .json({ code: 409, message: "Invalid credentials" });
    }

    const {
      _id,
      username,
      email: userEmail,
      createdAt,
      updatedAt,
    } = userByEmail;

    req.session.user = {
      _id,
      username,
      email: userEmail,
      createdAt,
      updatedAt,
    };

    return res.status(200).json({
      code: 200,
      message: "User signed in!",
      user: {
        id: _id,
        username,
        email: userEmail,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "There was a problem logging into your account",
      error,
    });
  }
};

const logout = async (req, res) => {
  try {
    const { user } = req.session;

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User is not logged in",
      });
    }

    req.session.destroy((error) => {
      if (error) {
        debug(error);
      }
    });

    return res.status(204).send({
      code: 204,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "There was a problem logging out",
      error,
    });
  }
};

export {
  signUp,
  signIn,
  logout,
  hashPassword,
  verifyPassword,
  validatePassword,
};
