const FavoriteModel = require("../../Models/Favorites/FavoriteModel");
const EventModel = require("../../Models/Events/EventModel");
const { sendErrorResponse, sendSuccessResponse, sendCreateSuccessResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

// ── Toggle Favorite ────────────────────────────────────────────────────────────
// POST /favorites/:eventId
// Returns { favorited: true/false }
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Event not found.");
    }

    const existing = await FavoriteModel.findOne({ userId, eventId });

    if (existing) {
      await FavoriteModel.deleteOne({ _id: existing._id });
      return res.status(STATUS.OK).json({ success: true, favorited: false, message: "Removed from favorites." });
    }

    await FavoriteModel.create({ userId, eventId });
    return res.status(STATUS.CREATED).json({ success: true, favorited: true, message: "Added to favorites." });
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update favorites.");
  }
};

// ── Get User Favorites ─────────────────────────────────────────────────────────
// GET /favorites
// Returns the full event objects the user has favorited
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await FavoriteModel.find({ userId })
      .populate({
        path: "eventId",
        model: "Events",
        select: "title type tag city location venue address date time endTime price priceLabel capacity registered status image gallery amenities description organizerName createdDate",
      })
      .sort({ createdAt: -1 })
      .lean();

    const events = favorites
      .filter((f) => f.eventId)
      .map((f) => ({
        ...f.eventId,
        id: f.eventId._id,
        image: f.eventId.image?.url ?? f.eventId.image ?? "",
        gallery: (f.eventId.gallery || []).map((g) => g?.url ?? g).filter(Boolean),
        favoritedAt: f.createdAt,
      }));

    return sendSuccessResponse(res, STATUS.OK, "Favorites fetched successfully.", events, "favorites");
  } catch (error) {
    console.error("getUserFavorites error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch favorites.");
  }
};

// ── Get Favorite Status for an Event ──────────────────────────────────────────
// GET /favorites/status/:eventId
// Used by event detail page to check if current user has favorited
const getFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const existing = await FavoriteModel.findOne({ userId, eventId });
    return res.status(STATUS.OK).json({ success: true, favorited: !!existing });
  } catch (error) {
    console.error("getFavoriteStatus error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to check favorite status.");
  }
};

// ── Get All Favorited Event IDs for User ───────────────────────────────────────
// GET /favorites/ids
// Lightweight endpoint to seed client-side set of favorited IDs
const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await FavoriteModel.find({ userId }, "eventId").lean();
    const ids = favorites.map((f) => f.eventId.toString());
    return res.status(STATUS.OK).json({ success: true, ids });
  } catch (error) {
    console.error("getFavoriteIds error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch favorite IDs.");
  }
};

module.exports = { toggleFavorite, getUserFavorites, getFavoriteStatus, getFavoriteIds };
