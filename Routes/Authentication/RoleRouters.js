const express = require("express");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const roleRouters = new express.Router();
const roleController = require("../../Controllers/Authentication/RoleController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

// ─── Health Check ─────────────────────────────────────────────────────────────
roleRouters.get("/", (req, res) => {
    res.send("Backend is live 🚀");
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
roleRouters.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// Google OAuth Callback
roleRouters.get(
    "/auth/google/callback",
    (req, res, next) => {
        console.log("[GoogleCallback] Hit callback route");
        passport.authenticate("google", {
            failureRedirect: `${process.env.WEB_URL}/login`,
            failureMessage: true,
        })(req, res, (err) => {
            if (err) {
                console.error("[GoogleCallback] passport.authenticate error:", err.message);
                return next(err);
            }
            console.log("[GoogleCallback] Authenticated, req.user:", req.user ? req.user.email : "null");
            next();
        });
    },
    (req, res) => {
        if (!req.user) {
            console.error("[GoogleCallback] req.user is null after auth — redirecting to login");
            return res.redirect(`${process.env.WEB_URL}/login`);
        }

        const user = req.user;
        const rawToken = user.token.startsWith("Bearer ") ? user.token.slice(7) : user.token;

        console.log("[GoogleCallback] Setting cookie, NODE_ENV:", process.env.NODE_ENV);
        res.cookie("token", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("[GoogleCallback] Redirecting to:", `${process.env.WEB_URL}/auth/success`);
        res.redirect(`${process.env.WEB_URL}/auth/success`);
    }
);

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Please try again in 15 minutes." },
});

// ─── Auth Routes (Public) ─────────────────────────────────────────────────────
roleRouters.post("/login", loginLimiter, roleController.login);
roleRouters.post("/register", roleController.register);
roleRouters.post("/logout", roleController.logout);
roleRouters.post("/forgot-password", passwordResetLimiter, roleController.forgotPassword);
roleRouters.post("/reset-password/:token", roleController.resetPassword);
roleRouters.post("/reset-password-otp", roleController.resetPasswordOtp);

// ─── Profile Route (Authenticated) ───────────────────────────────────────────
roleRouters.get("/me", authenticate, roleController.getMe);

// ─── Admin: User Management ───────────────────────────────────────────────────
// GET /admin/users?search=&role=&status=
roleRouters.get(
    "/admin/users",
    authenticate,
    authorizeRole("Admin"),
    roleController.getAllUsers
);

// PATCH /admin/users/:id/status
roleRouters.patch(
    "/admin/users/:id/status",
    authenticate,
    authorizeRole("Admin"),
    roleController.updateUserStatus
);

module.exports = roleRouters;
