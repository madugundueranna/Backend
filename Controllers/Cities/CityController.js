const cityModel = require("../../Models/Cities/CityModel");
const eventModel = require("../../Models/Events/EventModel");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const moment = require("moment-timezone");

const normalize = (str) => str.trim().replace(/\s+/g, " ");

// ─── GET /cities ──────────────────────────────────────────────────────────────
exports.getCities = async (req, res) => {
  try {
    const cities = await cityModel.find().sort({ name: 1 });
    return sendSuccessResponse(res, STATUS.OK, "Cities fetched successfully.", cities, "cities");
  } catch (err) {
    console.error("getCities error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch cities.");
  }
};

// ─── POST /cities ─────────────────────────────────────────────────────────────
exports.createCity = async (req, res) => {
  const raw = req.body.name;
  if (!raw || typeof raw !== "string") {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name is required.");
  }

  const name = normalize(raw);
  if (name.length === 0) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name cannot be empty.");
  }
  if (name.length > 100) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name must be 100 characters or fewer.");
  }

  try {
    // Case-insensitive duplicate check
    const exists = await cityModel.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `City "${name}" already exists.`);
    }

    const city = await cityModel.create({ name });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "City added successfully.", { city });
  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `City "${name}" already exists.`);
    }
    console.error("createCity error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to add city.");
  }
};

// ─── PUT /cities/:id ──────────────────────────────────────────────────────────
exports.updateCity = async (req, res) => {
  const { id } = req.params;
  const raw = req.body.name;

  if (!raw || typeof raw !== "string") {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name is required.");
  }

  const name = normalize(raw);
  if (name.length === 0) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name cannot be empty.");
  }
  if (name.length > 100) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "City name must be 100 characters or fewer.");
  }

  try {
    const existing = await cityModel.findById(id);
    if (!existing) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "City not found.");
    }

    // Case-insensitive duplicate check (exclude self)
    const duplicate = await cityModel.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (duplicate) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `City "${name}" already exists.`);
    }

    const oldName = existing.name;
    const now = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    existing.name = name;
    existing.updatedDate = now;
    await existing.save();

    // Keep events in sync: rename city references
    await eventModel.updateMany({ city: oldName }, { $set: { city: name } });

    return sendSuccessResponse(res, STATUS.OK, "City updated successfully.", { city: existing }, "city");
  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `City "${name}" already exists.`);
    }
    console.error("updateCity error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update city.");
  }
};

// ─── DELETE /cities/:id ───────────────────────────────────────────────────────
exports.deleteCity = async (req, res) => {
  const { id } = req.params;

  try {
    const city = await cityModel.findById(id);
    if (!city) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "City not found.");
    }

    // Block deletion if any event references this city (by FK or legacy string)
    const inUse = await eventModel.countDocuments({
      $or: [{ cityId: city._id }, { city: city.name }],
    });
    if (inUse > 0) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        `Cannot delete "${city.name}" — it is used by ${inUse} event(s). Reassign those events first.`
      );
    }

    await cityModel.findByIdAndDelete(id);
    return sendSuccessResponse(res, STATUS.OK, `City "${city.name}" deleted successfully.`);
  } catch (err) {
    console.error("deleteCity error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete city.");
  }
};
