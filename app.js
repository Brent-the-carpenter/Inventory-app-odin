const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const storeRouter = require("./routes/store");
const compression = require("compression");
const debugDB = require("debug")("app:db");
const mongoDB = process.env.MONGO_URI;
const app = express();

// Set up rate limit
const limiter = RateLimit({
  windowMS: 1 * 60 * 1000,
  max: 20,
});

// Set up mongoose
mongoose.set("strictQuery", false);
main().catch((err) => debugDB(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(helmet());
app.use(limiter);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/store", storeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    title: "Error page",
    message: "Something went wrong",
    error: {
      status: 500,
      stack: "Error stack trace",
    },
  });
});

module.exports = app;
