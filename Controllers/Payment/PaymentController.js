const crypto = require("crypto");
const razorpay = require("../../Config/RazorpayConfig");
const ticketModel = require("../../Models/Tickets/TicketModel");
const eventModel = require("../../Models/Events/EventModel");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const { ERROR_MESSAGES } = require("../../Common/Constants");

const generateTicketId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `TKT-${timestamp}-${random}`;
};

const generateScanToken = () => crypto.randomUUID();

// ─── Create Razorpay Order ────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const { eventId, tier, price } = req.body;

  if (!eventId || price === undefined) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Event ID and price are required.");
  }

  try {
    const event = await eventModel.findById(eventId);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    if (event.status !== "Active") {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Booking is not available for this event.");
    }

    if (event.registered >= event.capacity) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Sorry, this event is sold out.");
    }

    const existingTicket = await ticketModel.findOne({
      eventId,
      userId: req.user._id,
      status: { $ne: "Cancelled" },
    });

    if (existingTicket) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "You have already booked a ticket for this event.");
    }

    const amountInSubunit = Math.round(Number(price) * 100);

    if (!amountInSubunit || amountInSubunit < 100) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Invalid ticket price. Minimum chargeable amount is ₹1.");
    }

    const order = await razorpay.orders.create({
      amount: amountInSubunit,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        eventId: String(eventId),
        tier: tier || "General",
        userId: String(req.user._id),
      },
    });

    return sendSuccessResponse(res, STATUS.OK, "Order created successfully.", { order }, "data");
  } catch (error) {
    console.error("Create Order Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to create payment order.");
  }
};

// ─── Verify Payment & Create Ticket ──────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    tier,
    price,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !eventId) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Payment verification data is incomplete.");
  }

  try {
    // Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return sendErrorResponse(res, STATUS.BAD_REQUEST, "Payment verification failed. Invalid signature.");
    }

    // Fetch event details
    const event = await eventModel.findById(eventId);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    if (event.registered >= event.capacity) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Sorry, this event is sold out.");
    }

    // Guard: prevent duplicate ticket after payment
    const existingTicket = await ticketModel.findOne({
      eventId,
      userId: req.user._id,
      status: { $ne: "Cancelled" },
    });

    if (existingTicket) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "You have already booked a ticket for this event.");
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
      eventImage: event.image,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      tier: tier || "General",
      price: ticketPrice,
      priceLabel,
      status: "Registered",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await newTicket.save();
    await eventModel.findByIdAndUpdate(eventId, { $inc: { registered: 1 } });

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      "Payment successful! Your QR ticket is ready.",
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
    console.error("Verify Payment Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Payment verified but ticket creation failed.");
  }
};
