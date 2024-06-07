const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connect db
require("./config/db");

// config passport js
const passport = require("passport");
app.use(passport.initialize());

// JWT for email sign up / log in
const jwtStrategy = require("./config/jwtStrategy");
passport.use(jwtStrategy);

// Google authentication
const googleStrategy = require("./config/googleStrategy");
passport.use(googleStrategy);

// routes
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

app.use("/", indexRouter);
app.use(
  "/api/v1/users",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    next();
  },
  userRouter,
);

app.use((err, req, res, next) => {
  res.status = err.status || 500;
  if (req.app.get("env") === "development") {
    res.json({
      message: err.message,
      error: err,
    });
  } else {
    res.json({
      message: err.message,
      error: {},
    });
  }
});
app.listen(3000, () => console.log("listening on port 3000"));
