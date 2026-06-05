const express = require("express");
const ticketRouters = new express.Router();
const ticketController = require("../../Controllers/Tickets/TicketController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");

// ─── Attendee Routes ──────────────────────────────────────────────────────────

// POST /tickets  – book a ticket
ticketRouters.post(
  "/tickets",
  authenticate,
  authorizeRole("User", "Admin"),
  ticketController.bookTicket
);

// GET /tickets/my  – get my booked tickets
ticketRouters.get(
  "/tickets/my",
  authenticate,
  authorizeRole("User", "Admin"),
  ticketController.getMyTickets
);

// ─── Organizer Routes ─────────────────────────────────────────────────────────

// POST /tickets/scan  – check in an attendee by scanToken (scanned from QR code)
ticketRouters.post(
  "/tickets/scan",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  ticketController.scanCheckIn
);

// PATCH /tickets/:ticketId/checkin  – check in an attendee by ticketId (manual fallback)
ticketRouters.patch(
  "/tickets/:ticketId/checkin",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  ticketController.checkInTicket
);

// GET /events/:id/tickets  – get all tickets for a specific event (Organizer/Admin)
ticketRouters.get(
  "/events/:id/tickets",
  authenticate,
  authorizeRole("Organizer", "Admin"),
  ticketController.getEventTickets
);

module.exports = ticketRouters;
