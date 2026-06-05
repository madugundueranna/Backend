const express = require("express");
const categoryRouters = new express.Router();
const categoryController = require("../../Controllers/EventCategories/EventCategoryController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");

// GET /event-categories — public, active only (populates filter dropdowns)
categoryRouters.get("/event-categories", categoryController.getCategories);

// GET /event-categories/all — admin only, all including inactive (admin management screen)
// Must be declared BEFORE /:id routes to avoid "all" being matched as an id
categoryRouters.get(
  "/event-categories/all",
  authenticate,
  authorizeRole("Admin"),
  categoryController.getAllCategoriesAdmin
);

// Admin-only writes
categoryRouters.post("/event-categories", authenticate, authorizeRole("Admin"), categoryController.createCategory);
categoryRouters.put("/event-categories/:id", authenticate, authorizeRole("Admin"), categoryController.updateCategory);
categoryRouters.patch("/event-categories/:id/toggle", authenticate, authorizeRole("Admin"), categoryController.toggleActive);
categoryRouters.delete("/event-categories/:id", authenticate, authorizeRole("Admin"), categoryController.deleteCategory);

module.exports = categoryRouters;
