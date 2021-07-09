import express from "express";
import logger from "morgan";
import helmet from "helmet";
import session from "express-session";
import cors from "cors";
import redis from "redis";
import ConnectRedis from "connect-redis";
import config from "./config/index.js";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import currentUserRouter from "./routes/currentUser.js";
import notesRouter from "./routes/notes.js";
import adminRouter from "./routes/admin.js";

const RedisStore = ConnectRedis(session);
const redisClient = redis.createClient();

const app = express();
const isProduction = config.nodeEnv === "production";

app.use(
  cors({
    credentials: true,
    origin: config.clientUrl,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  })
);
app.use(helmet());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    name: "my_memo_session",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 86400 * 1000,
      secure: isProduction,
      httpOnly: false,
      sameSite: isProduction ? "none" : "strict",
    },
    store:
      process.env.NODE_ENV === "production"
        ? new RedisStore({
            url: process.env.REDIS_URL,
          })
        : new RedisStore({
            host: "localhost",
            port: 6379,
            client: redisClient,
          }),
  })
);
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/me", currentUserRouter);
app.use("/notes", notesRouter);
app.use("/admin", adminRouter);

// eslint-disable-next-line
app.use((error, req, res, next) => {
  return res.status(error.httpCode || 500).json({
    error,
  });
});

export default app;
