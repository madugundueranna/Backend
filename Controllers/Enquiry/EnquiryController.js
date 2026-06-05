const Enquiry = require("../../Models/Enquiry/EnquiryModel");
const ReportIssue = require("../../Models/ReportIssue/ReportIssueModel");
const { sendSuccessResponse, sendErrorResponse, sendCreateSuccessResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const { uploadToCloudinary } = require("../../Config/FileUpload");
const EmailService = require("../../Common/EmailService");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// ─── Submit Contact Enquiry ────────────────────────────────────────────────────
exports.submitEnquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "name, email, and message are required.");
    }

    const enquiry = await Enquiry.create({ name, email, message });

    EmailService.sendContactNotification(ADMIN_EMAIL, { name, email, message, createdAt: enquiry.createdAt });
    EmailService.sendContactConfirmation(email, name);

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      "Thank you! We'll get back to you within 24 hours.",
      { id: enquiry._id }
    );
  } catch (error) {
    console.error("Submit Enquiry Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to submit enquiry. Please try again.");
  }
};

// ─── Submit Report Issue ──────────────────────────────────────────────────────
exports.submitReportIssue = async (req, res) => {
  try {
    const { issueType, description } = req.body;

    if (!issueType || !description) {
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "issueType and description are required.");
    }

    let screenshotData = { url: "", publicId: "" };

    if (req.file) {
      try {
        const uploaded = await uploadToCloudinary(req.file, "qreventix/issues");
        screenshotData = { url: uploaded.secure_url, publicId: uploaded.public_id };
      } catch (uploadError) {
        console.error("Screenshot upload error:", uploadError);
      }
    }

    const report = await ReportIssue.create({
      issueType,
      description,
      screenshot: screenshotData,
    });

    EmailService.sendReportIssueNotification(ADMIN_EMAIL, { issueType, description, createdAt: report.createdAt });

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      "Issue reported successfully. Our team will investigate.",
      { id: report._id }
    );
  } catch (error) {
    console.error("Submit Report Issue Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to submit report. Please try again.");
  }
};
