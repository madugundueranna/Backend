const express = require("express");
const cityRouters = new express.Router();
const cityController = require("../../Controllers/Cities/CityController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");

// GET /cities — public, used by filter dropdowns
cityRouters.get("/cities", cityController.getCities);

// Admin-only writes
cityRouters.post("/cities", authenticate, authorizeRole("Admin"), cityController.createCity);
cityRouters.put("/cities/:id", authenticate, authorizeRole("Admin"), cityController.updateCity);
cityRouters.delete("/cities/:id", authenticate, authorizeRole("Admin"), cityController.deleteCity);

module.exports = cityRouters;
