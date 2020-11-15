#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from "http";
import Debug from "debug";
import app from "../app.js";
import connect from "../loaders/mongoose.js";
import config from "../config/index.js";

const debug = Debug("my-memo-api:server");

/**
 * Get port from environment and store in Express.
 */

const port = config.port || "3000";
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

// server.listen(port);
// server.on("listening", () => {
//   const addr = server.address();
//   const bind =
//     typeof addr === "string" ? ("pipe ", addr) : ("port ", addr.port);
//   debug("Listening on debug ", bind);
// });

const start = async () => {
  try {
    await connect();
    server.listen(port);
    server.on("listening", () => {
      const addr = server.address();
      const bind =
        typeof addr === "string" ? ("pipe ", addr) : ("port ", addr.port);
      debug("Listening on debug ", bind);
    });
  } catch (e) {
    debug(e);
  }
};

start();
