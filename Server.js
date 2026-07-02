require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const router = require("./Routes/Routers");
const passport = require("./Controllers/Authentication/GoogleAuthController");
require("./Config/DBConnect");

const job = require("./Config/Cron");

const app = express();
const PORT = process.env.PORT || 1998;

// CORS
const allowedOrigins = process.env.WEB_URL
  ? [process.env.WEB_URL, process.env.WEB_URL.replace(":5173", ":5174")]
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Session
app.use(
  session({
    secret: process.env.SECRET_KEY || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

/**
 * Database Documentation Route
 * Place DATABASE_DOCUMENTATION.md in the project root
 */
app.get("/documentation", (req, res) => {
  const filePath = path.join(__dirname, "DATABASE_DOCUMENTATION.md");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("DATABASE_DOCUMENTATION.md not found.");
    }

    const html = marked(data);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Database Documentation</title>

        <style>
          body{
            max-width:1000px;
            margin:40px auto;
            padding:20px;
            font-family:Arial,sans-serif;
            line-height:1.8;
            background:#f5f5f5;
            color:#333;
          }

          h1,h2,h3,h4{
            color:#0d6efd;
          }

          table{
            border-collapse:collapse;
            width:100%;
          }

          table,th,td{
            border:1px solid #ccc;
          }

          th,td{
            padding:10px;
          }

          pre{
            background:#1e1e1e;
            color:#fff;
            padding:15px;
            overflow:auto;
            border-radius:6px;
          }

          code{
            background:#efefef;
            padding:2px 4px;
            border-radius:4px;
          }

          img{
            max-width:100%;
          }
        </style>

      </head>
      <body>
        ${html}
      </body>
      </html>
    `);
  });
});

// Routes
app.use(router);

// Cron Job
job.start();

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message || err);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
