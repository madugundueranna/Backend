const express = require("express");
const router = express.Router();
const { upload } = require("../../Config/FileUpload");
const { submitEnquiry, submitReportIssue } = require("../../Controllers/Enquiry/EnquiryController");

// POST /contact  — contact-us form
router.post("/contact", submitEnquiry);

// POST /report-issue  — optional screenshot upload
router.post("/report-issue", upload.single("screenshot"), submitReportIssue);

module.exports = router;
