const express = require("express");
const router = express.Router();
const { authenticate } = require("../../Common/Middleware/AuthMiddleware");
const {
  toggleFavorite,
  getUserFavorites,
  getFavoriteStatus,
  getFavoriteIds,
} = require("../../Controllers/Favorites/FavoriteController");

// All favorite routes require authentication
router.post("/favorites/:eventId", authenticate, toggleFavorite);
router.get("/favorites", authenticate, getUserFavorites);
router.get("/favorites/ids", authenticate, getFavoriteIds);
router.get("/favorites/status/:eventId", authenticate, getFavoriteStatus);

module.exports = router;
