const Enquiry     = require("../../Models/Enquiry/EnquiryModel");
const ReportIssue = require("../../Models/ReportIssue/ReportIssueModel");

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT ENQUIRIES
// ══════════════════════════════════════════════════════════════════════════════

exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Enquiries fetched.", enquiries, "enquiries");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch enquiries.");
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "read", "resolved"];
    if (!status || !allowed.includes(status))
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `status must be one of: ${allowed.join(", ")}`);

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!enquiry) return sendErrorResponse(res, STATUS.NOT_FOUND, "Enquiry not found.");
    return sendSuccessResponse(res, STATUS.OK, "Enquiry status updated.", enquiry, "enquiry");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update enquiry status.");
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return sendErrorResponse(res, STATUS.NOT_FOUND, "Enquiry not found.");
    return sendSuccessResponse(res, STATUS.OK, "Enquiry deleted.", {}, "enquiry");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete enquiry.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// REPORT ISSUES
// ══════════════════════════════════════════════════════════════════════════════

exports.getReportIssues = async (req, res) => {
  try {
    const reports = await ReportIssue.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Reports fetched.", reports, "reports");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch reports.");
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "in_progress", "resolved"];
    if (!status || !allowed.includes(status))
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, `status must be one of: ${allowed.join(", ")}`);

    const report = await ReportIssue.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!report) return sendErrorResponse(res, STATUS.NOT_FOUND, "Report not found.");
    return sendSuccessResponse(res, STATUS.OK, "Report status updated.", report, "report");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update report status.");
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await ReportIssue.findByIdAndDelete(req.params.id);
    if (!report) return sendErrorResponse(res, STATUS.NOT_FOUND, "Report not found.");
    return sendSuccessResponse(res, STATUS.OK, "Report deleted.", {}, "report");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete report.");
  }
};
