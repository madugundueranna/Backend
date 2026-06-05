const express = require("express");
const router = new express.Router();

// ─── Authentication Routes ─────────────────────────────────────────────────────
const roleRouters = require("./Authentication/RoleRouters");
router.use(roleRouters);

// ─── Event Routes ──────────────────────────────────────────────────────────────
const eventRouters = require("./Events/EventRouters");
router.use(eventRouters);

// ─── Ticket Routes ─────────────────────────────────────────────────────────────
const ticketRouters = require("./Tickets/TicketRouters");
router.use(ticketRouters);

// ─── Payment Routes ────────────────────────────────────────────────────────────
const paymentRouters = require("./Payment/PaymentRouters");
router.use(paymentRouters);

// ─── City Routes ───────────────────────────────────────────────────────────────
const cityRouters = require("./Cities/CityRouters");
router.use(cityRouters);

// ─── Event Category Routes ─────────────────────────────────────────────────────
const categoryRouters = require("./EventCategories/EventCategoryRouters");
router.use(categoryRouters);

// ─── OTP Routes ────────────────────────────────────────────────────────────────
const otpRouters = require("./OTP/OtpRouters");
router.use(otpRouters);

// ─── Favorite Routes ────────────────────────────────────────────────────────────
const favoriteRouters = require("./Favorites/FavoriteRouters");
router.use(favoriteRouters);

// ─── Enquiry / Report Issue Routes ────────────────────────────────────────────
const enquiryRouters = require("./Enquiry/EnquiryRouters");
router.use(enquiryRouters);

// ─── Admin (Content CRUD + Submissions) ───────────────────────────────────────
const adminRouters = require("./Admin/AdminRouters");
router.use(adminRouters);

// ─── Content (About / Careers / Blog / Press / Help / Contact Info) ───────────
const aboutRouters       = require("./Content/AboutRouters");
const careerRouters      = require("./Content/CareerRouters");
const blogRouters        = require("./Content/BlogRouters");
const pressRouters       = require("./Content/PressRouters");
const helpRouters        = require("./Content/HelpRouters");
const contactInfoRouters = require("./Content/ContactInfoRouters");
router.use(aboutRouters);
router.use(careerRouters);
router.use(blogRouters);
router.use(pressRouters);
router.use(helpRouters);
router.use(contactInfoRouters);

module.exports = router;
