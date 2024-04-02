import express from "express";
import "./loadEnvironment.mjs";
import cors from "cors";
import login from "./controllers/login.mjs";
import signup from "./controllers/signup.mjs";
import sql from "./db/conn.mjs";
import users from "./controllers/users.mjs";
import morgan from "morgan"; // For logging requests
import winston from "winston"; // For custom logging
import courses from "./controllers/courses.mjs";
let { PORT } = process.env;

const app = express();
const port = PORT || 3000;

// Logging setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

// Middleware to log requests
app.use(morgan("dev"));

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  // Log an info message for each incoming request
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

// Middleware for error handling
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

async function getPgVersion() {
  try {
    const result = await sql.query("SELECT version()");
    console.log(result.rows[0]);
  } finally {
  }
}

getPgVersion();

app.get("/", (req, res) => {
  res.send("Running 3000");
});

app.post("/login", (req, res) => {
  login(req, res);
});

app.put("/signup", (req, res) => {
  signup.signup(req, res);
});

app.put("/verify/:email", (req, res) => {
  signup.emailVerify(req, res);
});

app.get("/users", (req, res) => {
  users.getUsers(req, res);
});

app.delete("/users/delete", (req, res) => {
  users.deleteUser(req, res);
});

app.put("/users/password/update", (req, res) => {
  users.updatePassword(req, res);
});

app.get("/courses", (req, res) => {
  courses.getCourses(req, res);
});

app.post("/courses/enroll", (req, res) => {
  courses.enrollCourse(req, res);
});

app.get("/courses/:userId", (req, res) => {
  courses.viewEnrolledCourses(req, res);
});

app.post("/courses/add", (req, res) => {
  courses.addCourse(req, res);
});

app.put("/courses/:id", (req, res) => {
  courses.updateCourse(req, res);
});

app.delete("/courses/delete/:id", (req, res) => {
  courses.deleteCourse(req, res);
});

app.listen(port, () => {
  console.log(`app is on port ${port}`);
});
