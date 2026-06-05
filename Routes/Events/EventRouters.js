const express = require("express");
const eventRouters = new express.Router();
const eventController = require("../../Controllers/Events/EventController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");
const { upload } = require("../../Config/FileUpload");

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /stats  – platform-wide aggregate stats
eventRouters.get("/stats", eventController.getStats);

// GET /events?search=&type=&city=&status=&limit=&page=
eventRouters.get("/events", eventController.getAllEvents);

// GET /events/:id
eventRouters.get("/events/:id", eventController.getEventById);

// ─── Organizer Routes (authenticated) ────────────────────────────────────────

// POST /events  – create event (Organizer or Admin)
eventRouters.post(
  "/events",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  eventController.createEvent
);

// GET /organizer/events  – get organizer's own events
eventRouters.get(
  "/organizer/events",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  eventController.getMyEvents
);

// PUT /events/:id  – update event
eventRouters.put(
  "/events/:id",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  eventController.updateEvent
);

// DELETE /events/:id  – delete event
eventRouters.delete(
  "/events/:id",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  eventController.deleteEvent
);

// POST /events/:id/gallery  – append new images to gallery
eventRouters.post(
  "/events/:id/gallery",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  upload.array("gallery", 10),
  eventController.addGalleryImages
);

// DELETE /events/:id/gallery  – remove one gallery image by publicId
eventRouters.delete(
  "/events/:id/gallery",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  eventController.removeGalleryImage
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// PATCH /events/:id/status  – approve/reject event
eventRouters.patch(
  "/events/:id/status",
  authenticate,
  authorizeRole("Admin"),
  eventController.updateEventStatus
);

module.exports = eventRouters;
