const crypto = require("crypto");
const ticketModel = require("../../Models/Tickets/TicketModel");
const eventModel = require("../../Models/Events/EventModel");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const { ERROR_MESSAGES, RESPONSE_MESSAGES } = require("../../Common/Constants");
const moment = require("moment-timezone");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateTicketId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `TKT-${timestamp}-${random}`;
};

const generateScanToken = () => crypto.randomUUID();

// ─── Book Ticket ──────────────────────────────────────────────────────────────
exports.bookTicket = async (req, res) => {
  const { eventId, tier, price } = req.body;

  if (!eventId) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Event ID is required.");
  }

  try {
    // Fetch the event
    const event = await eventModel.findById(eventId);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    if (event.status !== "Active") {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        "Booking is not available for this event at the moment."
      );
    }

    if (event.registered >= event.capacity) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        "Sorry, this event is sold out."
      );
    }

    // Check if user already booked this event
    const existingTicket = await ticketModel.findOne({
      eventId,
      userId: req.user._id,
      status: { $ne: "Cancelled" },
    });

    if (existingTicket) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        "You have already booked a ticket for this event."
      );
    }

    const ticketPrice = price !== undefined ? Number(price) : event.price;
    const priceLabel = ticketPrice > 0 ? `₹${Number(ticketPrice).toLocaleString("en-IN")}` : "Free";

    const newTicket = new ticketModel({
      ticketId: generateTicketId(),
      scanToken: generateScanToken(),
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.location,
      eventImage: event.image?.url || "",
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      tier: tier || "General",
      price: ticketPrice,
      priceLabel,
      status: "Registered",
    });

    await newTicket.save();

    // Increment registered count on event
    await eventModel.findByIdAndUpdate(eventId, { $inc: { registered: 1 } });

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      "Ticket booked successfully! Your QR ticket is ready.",
      {
        ticketId: newTicket.ticketId,
        scanToken: newTicket.scanToken,
        _id: newTicket._id,
        tier: newTicket.tier,
        priceLabel: newTicket.priceLabel,
        status: newTicket.status,
        eventTitle: newTicket.eventTitle,
        eventDate: newTicket.eventDate,
        eventVenue: newTicket.eventVenue,
      }
    );
  } catch (error) {
    console.error("Book Ticket Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.CREATE_FAILED);
  }
};

// ─── Get My Tickets (Attendee) ────────────────────────────────────────────────
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketModel
      .find({ userId: req.user._id, status: { $ne: "Cancelled" } })
      .sort({ createdDate: -1 });

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("My Tickets"),
      tickets,
      "tickets"
    );
  } catch (error) {
    console.error("Get My Tickets Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Check In Ticket (Organizer) ──────────────────────────────────────────────
exports.checkInTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await ticketModel.findOne({ ticketId });

    if (!ticket) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Ticket not found. Invalid QR code.");
    }

    if (ticket.status === "Checked-In") {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        `${ticket.userName || "This attendee"} has already been checked in.`
      );
    }

    if (ticket.status === "Cancelled") {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "This ticket has been cancelled.");
    }

    const currentIST = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    const updatedTicket = await ticketModel.findOneAndUpdate(
      { ticketId },
      { status: "Checked-In", checkedInAt: currentIST, updatedDate: currentIST },
      { new: true }
    );

    return sendSuccessResponse(
      res,
      STATUS.OK,
      `${updatedTicket.userName || "Attendee"} checked in successfully!`,
      updatedTicket,
      "ticket"
    );
  } catch (error) {
    console.error("Check-In Ticket Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.STATUS_UPDATE_FAILED);
  }
};

// ─── Scan Check-In (by scanToken) ────────────────────────────────────────────
// POST /tickets/scan  — body: { scanToken }
exports.scanCheckIn = async (req, res) => {
  const { scanToken } = req.body;

  if (!scanToken) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Scan token is required.");
  }

  try {
    const ticket = await ticketModel.findOne({ scanToken });

    if (!ticket) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, "Invalid QR code. Ticket not found.");
    }

    if (ticket.status === "Checked-In") {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        `${ticket.userName || "This attendee"} has already been checked in at ${ticket.checkedInAt}.`
      );
    }

    if (ticket.status === "Cancelled") {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "This ticket has been cancelled.");
    }

    const currentIST = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    const updatedTicket = await ticketModel.findOneAndUpdate(
      { scanToken },
      { status: "Checked-In", checkedInAt: currentIST, updatedDate: currentIST },
      { new: true }
    );

    return sendSuccessResponse(
      res,
      STATUS.OK,
      `${updatedTicket.userName || "Attendee"} checked in successfully!`,
      updatedTicket,
      "ticket"
    );
  } catch (error) {
    console.error("Scan Check-In Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.STATUS_UPDATE_FAILED);
  }
};

// ─── Get Event Tickets (Organizer) ────────────────────────────────────────────
exports.getEventTickets = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await eventModel.findById(id);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    // Organizer can only see their own event tickets
    if (
      req.user.role === "Organizer" &&
      String(event.organizerId) !== String(req.user._id)
    ) {
      return sendErrorResponse(res, STATUS.FORBIDDEN, ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    const tickets = await ticketModel
      .find({ eventId: id })
      .sort({ createdDate: -1 });

    const checkedInCount = tickets.filter((t) => t.status === "Checked-In").length;

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("Event Tickets"),
      { tickets, total: tickets.length, checkedInCount },
      "data"
    );
  } catch (error) {
    console.error("Get Event Tickets Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};
