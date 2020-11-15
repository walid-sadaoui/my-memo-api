import mongoose from "mongoose";
import Debug from "debug";
import config from "../config/index.js";

const debug = Debug("my-memo-api:mongoose");

const connect = () => {
  const connection = mongoose.connect(config.databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "Erreur lors de la connexion"));
  db.once("open", () => {
    debug("Connected to MongoDb");
  });
  return connection;
};

export default connect;
