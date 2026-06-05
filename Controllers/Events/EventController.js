const eventModel = require("../../Models/Events/EventModel");
const { getMissingFields } = require("../../Common/Validators");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const { ERROR_MESSAGES, RESPONSE_MESSAGES } = require("../../Common/Constants");
const moment = require("moment-timezone");
const { uploadToCloudinary, uploadMultipleToCloudinary, cloudinary } = require("../../Config/FileUpload");

const EVENT_REQUIRED_FIELDS = ["title", "type", "date", "time", "capacity", "city", "location"];

// Parse a JSON string field from FormData, returning the fallback on failure
const parseJSON = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

// Normalize a multer string field that may be a single string or already an array
const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

// ─── Create Event ─────────────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
  const missingFields = getMissingFields(req.body, EVENT_REQUIRED_FIELDS);

  if (missingFields.length > 0) {
    return sendErrorResponse(
      res,
      STATUS.UNPROCESSABLE_ENTITY,
      `The following fields are required: ${missingFields.join(", ")}`
    );
  }

  try {
    const {
      title, type, tag, city, location, venue, address, pincode,
      googleMapsLink, date, time, endTime, price, priceLabel, capacity,
      expectedRegistrations, description,
    } = req.body;

    const amenities = parseArrayField(req.body.amenities);
    const tiers = parseJSON(req.body.tiers, []);
    const organizerContact = parseJSON(req.body.organizerContact, {});

    // Main image
    let imageData = { url: "", publicId: "" };
    if (req.files && req.files.image) {
      try {
        const uploaded = await uploadToCloudinary(req.files.image[0], "qreventix/events");
        imageData = { url: uploaded.secure_url, publicId: uploaded.public_id };
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to upload banner image. Please try again.");
      }
    }

    // Gallery images
    let galleryData = [];
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      try {
        const uploaded = await uploadMultipleToCloudinary(req.files.gallery, "qreventix/events/gallery");
        galleryData = uploaded.map((img) => ({ url: img.url, publicId: img.public_id }));
      } catch (uploadError) {
        console.error("Gallery upload error:", uploadError);
        return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to upload gallery images. Please try again.");
      }
    }

    const newEvent = new eventModel({
      title,
      type,
      tag: tag || "",
      city,
      location,
      venue: venue || "",
      address: address || "",
      pincode: pincode || "",
      googleMapsLink: googleMapsLink || "",
      date,
      time,
      endTime: endTime || "",
      price: price || 0,
      priceLabel: price ? `₹${Number(price).toLocaleString("en-IN")}` : priceLabel || "Free",
      capacity: Number(capacity),
      expectedRegistrations: expectedRegistrations ? Number(expectedRegistrations) : 0,
      registered: 0,
      status: req.user.role === "Admin" ? "Active" : "Under Review",
      description: description || "",
      image: imageData,
      gallery: galleryData,
      amenities,
      tiers,
      organizerId: req.user._id,
      organizerName: req.user.name,
      organizerContact,
    });

    await newEvent.save();

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      RESPONSE_MESSAGES.CREATION_SUCCESS("Event"),
      { _id: newEvent._id, status: newEvent.status, imageUrl: imageData.url }
    );
  } catch (error) {
    console.error("Create Event Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.CREATE_FAILED);
  }
};

// ─── Get All Events (Public – with filters) ───────────────────────────────────
exports.getAllEvents = async (req, res) => {
  try {
    const { search, type, city, city_id, category_id, status, limit, page } = req.query;

    const query = {};

    // Only show Active events on public routes; admin can see all
    if (!status) {
      query.status = "Active";
    } else if (status !== "All") {
      query.status = status;
    }

    // FK-based city filter (new) takes precedence over string-based (legacy)
    if (city_id) {
      query.cityId = city_id;
    } else if (city && city !== "All Cities" && city !== "All") {
      query.city = city;
    }

    // FK-based category filter (new) takes precedence over string-based (legacy)
    if (category_id) {
      query.categoryId = category_id;
    } else if (type && type !== "All") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      eventModel.find(query).sort({ createdDate: -1 }).skip(skip).limit(limitNum),
      eventModel.countDocuments(query),
    ]);

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("Events"),
      { events, total, page: pageNum, limit: limitNum },
      "data"
    );
  } catch (error) {
    console.error("Get Events Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Get Single Event ─────────────────────────────────────────────────────────
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await eventModel.findById(id);

    if (!event) {
      return sendErrorResponse(
        res,
        STATUS.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND("Event")
      );
    }

    // Increment view count
    await eventModel.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("Event"),
      event,
      "event"
    );
  } catch (error) {
    console.error("Get Event Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Update Event ─────────────────────────────────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await eventModel.findById(id);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    // Organizers can only update their own events
    if (req.user.role === "Organizer" && String(event.organizerId) !== String(req.user._id)) {
      return sendErrorResponse(res, STATUS.FORBIDDEN, ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    const updatedFields = { ...req.body };
    delete updatedFields._id;

    // Auto-compute priceLabel if price is updated
    if (updatedFields.price !== undefined) {
      updatedFields.priceLabel =
        updatedFields.price > 0
          ? `₹${Number(updatedFields.price).toLocaleString("en-IN")}`
          : "Free";
    }

    // Handle main image upload
    if (req.files && req.files.image) {
      try {
        // Delete old image from Cloudinary using stored publicId
        if (event.image?.publicId) {
          await cloudinary.uploader.destroy(event.image.publicId);
        }

        const uploaded = await uploadToCloudinary(req.files.image[0], "qreventix/events");
        updatedFields.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to upload banner image. Please try again.");
      }
    }

    // Handle gallery images upload
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      try {
        // Delete old gallery images using stored publicIds
        if (event.gallery && event.gallery.length > 0) {
          for (const item of event.gallery) {
            if (item?.publicId) {
              await cloudinary.uploader.destroy(item.publicId);
            }
          }
        }

        const uploaded = await uploadMultipleToCloudinary(req.files.gallery, "qreventix/events/gallery");
        updatedFields.gallery = uploaded.map((img) => ({ url: img.url, publicId: img.public_id }));
      } catch (uploadError) {
        console.error("Gallery upload error:", uploadError);
        return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to upload gallery images. Please try again.");
      }
    }

    // Parse JSON fields that may arrive as strings from FormData
    if (typeof updatedFields.tiers === "string") {
      updatedFields.tiers = parseJSON(updatedFields.tiers, undefined);
    }
    if (typeof updatedFields.organizerContact === "string") {
      updatedFields.organizerContact = parseJSON(updatedFields.organizerContact, undefined);
    }
    if (updatedFields.amenities !== undefined) {
      updatedFields.amenities = parseArrayField(updatedFields.amenities);
    }

    const updatedEvent = await eventModel.findByIdAndUpdate(
      id,
      { ...updatedFields, updatedDate: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
      { new: true }
    );

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.UPDATE_SUCCESS("Event"),
      updatedEvent,
      "event"
    );
  } catch (error) {
    console.error("Update Event Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.UPDATE_FAILED("Event"));
  }
};

// ─── Delete Event ─────────────────────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await eventModel.findById(id);

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    // Organizers can only delete their own events
    if (req.user.role === "Organizer" && String(event.organizerId) !== String(req.user._id)) {
      return sendErrorResponse(res, STATUS.FORBIDDEN, ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    // Delete images from Cloudinary using stored publicIds
    try {
      if (event.image?.publicId) {
        await cloudinary.uploader.destroy(event.image.publicId);
      }

      if (event.gallery && event.gallery.length > 0) {
        for (const item of event.gallery) {
          if (item?.publicId) {
            await cloudinary.uploader.destroy(item.publicId);
          }
        }
      }
    } catch (deleteImageError) {
      console.error("Error deleting images from Cloudinary:", deleteImageError);
      // Continue with event deletion even if Cloudinary cleanup fails
    }

    await eventModel.findByIdAndDelete(id);

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.DELETION_SUCCESS("Event"),
      {},
      "data"
    );
  } catch (error) {
    console.error("Delete Event Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.DELETION_FAILED("Event"));
  }
};

// ─── Update Event Status (Admin Only) ─────────────────────────────────────────
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Active", "Under Review", "Rejected", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const event = await eventModel.findByIdAndUpdate(
      id,
      { status, updatedDate: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
      { new: true }
    );

    if (!event) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    }

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.STATUS_UPDATED_SUCCESS("Event"),
      event,
      "event"
    );
  } catch (error) {
    console.error("Update Event Status Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.STATUS_UPDATE_FAILED);
  }
};

// ─── Add Gallery Images ───────────────────────────────────────────────────────
exports.addGalleryImages = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventModel.findById(id);
    if (!event) return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    if (req.user.role === "Organizer" && String(event.organizerId) !== String(req.user._id)) {
      return sendErrorResponse(res, STATUS.FORBIDDEN, ERROR_MESSAGES.ROLE_NOT_FOUND);
    }
    if (!req.files || !req.files.length) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "No images provided.");
    }
    const currentCount = event.gallery ? event.gallery.length : 0;
    if (currentCount + req.files.length > 10) {
      return sendErrorResponse(
        res, STATUS.UNPROCESSABLE_ENTITY,
        `Gallery limit exceeded. Max 10 images. Event already has ${currentCount}.`
      );
    }
    const uploaded = await uploadMultipleToCloudinary(req.files, "qreventix/events/gallery");
    const newImages = uploaded.map((img) => ({ url: img.url, publicId: img.public_id }));
    const updatedEvent = await eventModel.findByIdAndUpdate(
      id,
      { $push: { gallery: { $each: newImages } }, updatedDate: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
      { new: true }
    );
    return sendSuccessResponse(res, STATUS.OK, "Gallery images added.", updatedEvent, "event");
  } catch (error) {
    console.error("Add Gallery Images Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to upload gallery images.");
  }
};

// ─── Remove Gallery Image ─────────────────────────────────────────────────────
exports.removeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { publicId } = req.body;
    if (!publicId) return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "publicId is required.");
    const event = await eventModel.findById(id);
    if (!event) return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("Event"));
    if (req.user.role === "Organizer" && String(event.organizerId) !== String(req.user._id)) {
      return sendErrorResponse(res, STATUS.FORBIDDEN, ERROR_MESSAGES.ROLE_NOT_FOUND);
    }
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cdnErr) {
      console.error("Cloudinary delete warning:", cdnErr.message);
    }
    const updatedEvent = await eventModel.findByIdAndUpdate(
      id,
      { $pull: { gallery: { publicId } }, updatedDate: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
      { new: true }
    );
    return sendSuccessResponse(res, STATUS.OK, "Gallery image removed.", updatedEvent, "event");
  } catch (error) {
    console.error("Remove Gallery Image Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to remove gallery image.");
  }
};

// ─── Platform Stats (Public) ──────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const ticketModel = require("../../Models/Tickets/TicketModel");

    const [totalEvents, registeredAgg, cities, typesAgg, revenueAgg] = await Promise.all([
      eventModel.countDocuments({}),
      eventModel.aggregate([{ $group: { _id: null, total: { $sum: "$registered" } } }]),
      eventModel.distinct("city"),
      eventModel.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      ticketModel.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
    ]);

    const typeCounts = {};
    typesAgg.forEach(({ _id, count }) => { if (_id) typeCounts[_id] = count; });

    return sendSuccessResponse(res, STATUS.OK, RESPONSE_MESSAGES.FETCH_SUCCESS("Stats"), {
      totalEvents,
      totalRegistered: registeredAgg[0]?.total || 0,
      totalCities: cities.filter(Boolean).length,
      totalRevenue: revenueAgg[0]?.total || 0,
      typeCounts,
    }, "stats");
  } catch (error) {
    console.error("Get Stats Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Get My Events (Organizer) ────────────────────────────────────────────────
exports.getMyEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find({ organizerId: req.user._id })
      .sort({ createdDate: -1 });

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("My Events"),
      events,
      "events"
    );
  } catch (error) {
    console.error("Get My Events Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};
