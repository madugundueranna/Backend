const About       = require("../../Models/Content/AboutModel");
const Career      = require("../../Models/Content/CareerModel");
const BlogPost    = require("../../Models/Content/BlogPostModel");
const Press       = require("../../Models/Content/PressModel");
const HelpFAQ     = require("../../Models/Content/HelpFAQModel");
const ContactInfo = require("../../Models/Content/ContactInfoModel");
const moment      = require("moment-timezone");

const {
  sendSuccessResponse,
  sendErrorResponse,
  sendCreateSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

const IST = () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

// ─── Helper: generate URL-safe slug ──────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT  (singleton)
// ══════════════════════════════════════════════════════════════════════════════

exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    return sendSuccessResponse(res, STATUS.OK, "About content fetched.", about || {}, "about");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch about content.");
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const update = req.body;
    const about = await About.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
    return sendSuccessResponse(res, STATUS.OK, "About content updated.", about, "about");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update about content.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// CAREERS
// ══════════════════════════════════════════════════════════════════════════════

exports.getCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Careers fetched.", careers, "careers");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch careers.");
  }
};

exports.createCareer = async (req, res) => {
  try {
    const { title, department, location, type, description, applicationEmail, isActive } = req.body;
    if (!title || !department || !location || !type || !description)
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "title, department, location, type, and description are required.");

    const career = await Career.create({
      title, department, location, type, description,
      applicationEmail: applicationEmail || "careers@qreventix.in",
      isActive: isActive !== undefined ? isActive : true,
      createdAt: IST(),
    });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "Career created.", career);
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to create career.");
  }
};

exports.updateCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!career) return sendErrorResponse(res, STATUS.NOT_FOUND, "Career not found.");
    return sendSuccessResponse(res, STATUS.OK, "Career updated.", career, "career");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update career.");
  }
};

exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) return sendErrorResponse(res, STATUS.NOT_FOUND, "Career not found.");
    return sendSuccessResponse(res, STATUS.OK, "Career deleted.", {}, "career");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete career.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// BLOG POSTS
// ══════════════════════════════════════════════════════════════════════════════

exports.getBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Blog posts fetched.", posts, "posts");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch blog posts.");
  }
};

exports.createBlogPost = async (req, res) => {
  try {
    const { title, excerpt, content, author, date, category, readTime, coverImageUrl, isPublished } = req.body;
    if (!title || !excerpt || !author)
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "title, excerpt, and author are required.");

    let slug = req.body.slug ? slugify(req.body.slug) : slugify(title);
    const existing = await BlogPost.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await BlogPost.create({
      title, slug, excerpt,
      content: content || "",
      author, date: date || IST().split(" ")[0],
      category: category || "Events",
      readTime: readTime || "5 min read",
      coverImage: { url: coverImageUrl || "", publicId: "" },
      isPublished: isPublished !== undefined ? isPublished : true,
      createdAt: IST(),
    });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "Blog post created.", post);
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to create blog post.");
  }
};

exports.updateBlogPost = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.coverImageUrl !== undefined) {
      update.coverImage = { url: update.coverImageUrl, publicId: "" };
      delete update.coverImageUrl;
    }
    if (update.slug) update.slug = slugify(update.slug);

    const post = await BlogPost.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!post) return sendErrorResponse(res, STATUS.NOT_FOUND, "Blog post not found.");
    return sendSuccessResponse(res, STATUS.OK, "Blog post updated.", post, "post");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update blog post.");
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return sendErrorResponse(res, STATUS.NOT_FOUND, "Blog post not found.");
    return sendSuccessResponse(res, STATUS.OK, "Blog post deleted.", {}, "post");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete blog post.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESS ITEMS
// ══════════════════════════════════════════════════════════════════════════════

exports.getPressItems = async (req, res) => {
  try {
    const items = await Press.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Press items fetched.", items, "press");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch press items.");
  }
};

exports.createPressItem = async (req, res) => {
  try {
    const { publication, headline, summary, date, logo, logoColor, link } = req.body;
    if (!publication || !headline || !summary)
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "publication, headline, and summary are required.");

    const item = await Press.create({
      publication, headline, summary,
      date: date || IST().split(" ")[0],
      logo: logo || "",
      logoColor: logoColor || "#4f46e5",
      link: link || "",
      createdAt: IST(),
    });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "Press item created.", item);
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to create press item.");
  }
};

exports.updatePressItem = async (req, res) => {
  try {
    const item = await Press.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) return sendErrorResponse(res, STATUS.NOT_FOUND, "Press item not found.");
    return sendSuccessResponse(res, STATUS.OK, "Press item updated.", item, "pressItem");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update press item.");
  }
};

exports.deletePressItem = async (req, res) => {
  try {
    const item = await Press.findByIdAndDelete(req.params.id);
    if (!item) return sendErrorResponse(res, STATUS.NOT_FOUND, "Press item not found.");
    return sendSuccessResponse(res, STATUS.OK, "Press item deleted.", {}, "pressItem");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete press item.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// HELP FAQs
// ══════════════════════════════════════════════════════════════════════════════

exports.getHelpFAQs = async (req, res) => {
  try {
    const faqs = await HelpFAQ.find().sort({ category: 1, order: 1 });
    return sendSuccessResponse(res, STATUS.OK, "FAQs fetched.", faqs, "faqs");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch FAQs.");
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { category, question, answer, order, isActive } = req.body;
    if (!category || !question || !answer)
      return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "category, question, and answer are required.");

    const faq = await HelpFAQ.create({
      category, question, answer,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    return sendCreateSuccessResponse(res, STATUS.CREATED, "FAQ created.", faq);
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to create FAQ.");
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faq = await HelpFAQ.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!faq) return sendErrorResponse(res, STATUS.NOT_FOUND, "FAQ not found.");
    return sendSuccessResponse(res, STATUS.OK, "FAQ updated.", faq, "faq");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update FAQ.");
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await HelpFAQ.findByIdAndDelete(req.params.id);
    if (!faq) return sendErrorResponse(res, STATUS.NOT_FOUND, "FAQ not found.");
    return sendSuccessResponse(res, STATUS.OK, "FAQ deleted.", {}, "faq");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to delete FAQ.");
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO  (singleton)
// ══════════════════════════════════════════════════════════════════════════════

exports.getContactInfo = async (req, res) => {
  try {
    const info = await ContactInfo.findOne();
    return sendSuccessResponse(res, STATUS.OK, "Contact info fetched.", info || {}, "contactInfo");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch contact info.");
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const info = await ContactInfo.findOneAndUpdate({}, { $set: req.body }, { new: true, upsert: true });
    return sendSuccessResponse(res, STATUS.OK, "Contact info updated.", info, "contactInfo");
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to update contact info.");
  }
};
