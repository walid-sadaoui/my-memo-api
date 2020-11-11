import argon2 from "argon2-ffi";
import crypto from "crypto";
import Promise from "bluebird";
import Debug from "debug";

const debug = Debug("my-memo-api:auth-service");

const { argon2i } = argon2;
const randomBytes = Promise.promisify(crypto.randomBytes);

const hashPassword = async (password) => {
  try {
    randomBytes(32)
      .then((salt) => argon2i.hash(password, salt))
      .then(debug);
  } catch (error) {
    debug(error);
  }
};

const verifyPassword = (encodedHash, password) => {
  argon2i
    .verify(encodedHash, password)
    .then((correct) =>
      debug(correct ? "Correct password!" : "Incorrect password")
    );
};

export { hashPassword, verifyPassword };
