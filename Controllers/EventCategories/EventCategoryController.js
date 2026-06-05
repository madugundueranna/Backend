const eventCategoryModel = require("../../Models/EventCategories/EventCategoryModel");
const eventModel = require("../../Models/Events/EventModel");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const moment = require("moment-timezone");

const normalize = (str) => str.trim().replace(/\s+/g, " ");

// ─── GET /event-categories  (public — active only, for dropdowns) ─────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await eventCategoryModel
      .find({ isActive: true })
      .sort({ name: 1 });
    return sendSuccessResponse(res, STATUS.OK, "Event categories fetched successfully.", categories, "categories");
  } catch (err) {
    console.error("getCategories error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch event categories.");
  }
};

// ─── GET /event-categories/all  (admin — all, including inactive) ─────────────
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await eventCategoryModel.find().sort({ name: 1 });
    return sendSuccessResponse(res, STATUS.OK, "All event categories fetched.", categories, "categories");
  } catch (err) {
    console.error("getAllCategoriesAdmin error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch event categories.");
  }
};

// ─── POST /event-categories ───────────────────────────────────────────────────
exports.createCategory = async (req, res) => {
  const raw = req.body.name;
  if (!raw || typeof raw !== "string") {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name is required.");
  }

  const name = normalize(raw);
  if (name.length === 0) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name cannot be empty.");
  }
  if (name.length > 100) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name must be 100 characters or fewer.");
  }

  try {
    const exists = await eventCategoryModel.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `Category "${name}" already exists.`);
    }

    const category = await eventCategoryModel.create({ name, isActive: true });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "Category added successfully.", { category });
  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `Category "${name}" already exists.`);
    }
    console.error("createCategory error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to add category.");
  }
};

// ─── PUT /event-categories/:id ────────────────────────────────────────────────
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const raw = req.body.name;

  if (!raw || typeof raw !== "string") {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name is required.");
  }

  const name = normalize(raw);
  if (name.length === 0) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name cannot be empty.");
  }
  if (name.length > 100) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Category name must be 100 characters or fewer.");
  }

  try {
    const existing = await eventCategoryModel.findById(id);
    if (!existing) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Category not found.");
    }

    const duplicate = await eventCategoryModel.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (duplicate) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `Category "${name}" already exists.`);
    }

    const oldName = existing.name;
    const now = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    existing.name = name;
    existing.updatedDate = now;
    await existing.save();

    await eventModel.updateMany({ type: oldName }, { $set: { type: name } });

    return sendSuccessResponse(res, STATUS.OK, "Category updated successfully.", { category: existing }, "category");
  } catch (err) {
    if (err.code === 11000) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `Category "${name}" already exists.`);
    }
    console.error("updateCategory error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update category.");
  }
};

// ─── PATCH /event-categories/:id/toggle  (admin — flip isActive) ─────────────
exports.toggleActive = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await eventCategoryModel.findById(id);
    if (!category) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Category not found.");
    }

    const now = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    category.isActive = !category.isActive;
    category.updatedDate = now;
    await category.save();

    const label = category.isActive ? "activated" : "deactivated";
    return sendSuccessResponse(
      res,
      STATUS.OK,
      `Category "${category.name}" ${label}.`,
      { category },
      "category"
    );
  } catch (err) {
    console.error("toggleActive error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to toggle category status.");
  }
};

// ─── DELETE /event-categories/:id ─────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await eventCategoryModel.findById(id);
    if (!category) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Category not found.");
    }

    // Block deletion if any event references this category (by FK or legacy string)
    const inUse = await eventModel.countDocuments({
      $or: [{ categoryId: category._id }, { type: category.name }],
    });
    if (inUse > 0) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        `Cannot delete "${category.name}" — it is used by ${inUse} event(s). Deactivate it instead, or reassign those events first.`
      );
    }

    await eventCategoryModel.findByIdAndDelete(id);
    return sendSuccessResponse(res, STATUS.OK, `Category "${category.name}" deleted successfully.`);
  } catch (err) {
    console.error("deleteCategory error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete category.");
  }
};
