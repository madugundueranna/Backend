const express  = require("express");
const router   = express.Router();
const auth     = require("../../Middleware/authMiddleware");
const isAdmin  = require("../../Middleware/adminMiddleware");

const {
  getAbout, updateAbout,
  getCareers, createCareer, updateCareer, deleteCareer,
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  getPressItems, createPressItem, updatePressItem, deletePressItem,
  getHelpFAQs, createFAQ, updateFAQ, deleteFAQ,
  getContactInfo, updateContactInfo,
} = require("../../Controllers/Admin/AdminContentController");

const {
  getEnquiries, updateEnquiryStatus, deleteEnquiry,
  getReportIssues, updateReportStatus, deleteReport,
} = require("../../Controllers/Admin/AdminSubmissionsController");

// All routes below require a valid JWT + Admin role
router.use(auth, isAdmin);

// ─── About (singleton) ────────────────────────────────────────────────────────
router.get("/admin/content/about",        getAbout);
router.put("/admin/content/about",        updateAbout);

// ─── Careers ──────────────────────────────────────────────────────────────────
router.get("/admin/content/careers",          getCareers);
router.post("/admin/content/careers",         createCareer);
router.put("/admin/content/careers/:id",      updateCareer);
router.delete("/admin/content/careers/:id",   deleteCareer);

// ─── Blog Posts ───────────────────────────────────────────────────────────────
router.get("/admin/content/blog-posts",          getBlogPosts);
router.post("/admin/content/blog-posts",         createBlogPost);
router.put("/admin/content/blog-posts/:id",      updateBlogPost);
router.delete("/admin/content/blog-posts/:id",   deleteBlogPost);

// ─── Press Items ──────────────────────────────────────────────────────────────
router.get("/admin/content/press-items",          getPressItems);
router.post("/admin/content/press-items",         createPressItem);
router.put("/admin/content/press-items/:id",      updatePressItem);
router.delete("/admin/content/press-items/:id",   deletePressItem);

// ─── Help FAQs ────────────────────────────────────────────────────────────────
router.get("/admin/content/help-faqs",          getHelpFAQs);
router.post("/admin/content/help-faqs",         createFAQ);
router.put("/admin/content/help-faqs/:id",      updateFAQ);
router.delete("/admin/content/help-faqs/:id",   deleteFAQ);

// ─── Contact Info (singleton) ─────────────────────────────────────────────────
router.get("/admin/content/contact-info",   getContactInfo);
router.put("/admin/content/contact-info",   updateContactInfo);

// ─── Submissions: Enquiries ────────────────────────────────────────────────────
router.get("/admin/submissions/enquiries",              getEnquiries);
router.patch("/admin/submissions/enquiries/:id/status", updateEnquiryStatus);
router.delete("/admin/submissions/enquiries/:id",       deleteEnquiry);

// ─── Submissions: Reports ─────────────────────────────────────────────────────
router.get("/admin/submissions/reports",              getReportIssues);
router.patch("/admin/submissions/reports/:id/status", updateReportStatus);
router.delete("/admin/submissions/reports/:id",       deleteReport);

module.exports = router;
