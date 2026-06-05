require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./Routes/Routers");
const passport = require("./Controllers/Authentication/GoogleAuthController");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
require("./Config/DBConnect");
const app = express();
const PORT = process.env.PORT || 1998;
const job = require("./Config/Cron");
const corsOptions = {
  origin: process.env.WEB_URL || "https://eventmangement2.netlify.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY || "secret123",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router);
job.start();
// Global error handler — catches multer, JWT, and uncaught route errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

// Server Starting
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
