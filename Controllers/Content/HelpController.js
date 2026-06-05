const HelpFAQ = require("../../Models/Content/HelpFAQModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getFAQs = async (req, res) => {
  try {
    const faqs = await HelpFAQ.find({ isActive: true }).sort({ category: 1, order: 1 });

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      const key = faq.category;
      if (!acc[key]) acc[key] = { category: key, items: [] };
      acc[key].items.push({ q: faq.question, a: faq.answer });
      return acc;
    }, {});

    const sections = Object.values(grouped);
    return sendSuccessResponse(res, STATUS.OK, "FAQs fetched.", sections, "faqs");
  } catch (error) {
    console.error("Get FAQs Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch FAQs.");
  }
};
