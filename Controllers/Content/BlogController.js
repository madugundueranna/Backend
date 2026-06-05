const BlogPost = require("../../Models/Content/BlogPostModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true }).sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Blog posts fetched.", posts, "posts");
  } catch (error) {
    console.error("Get Blog Posts Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch blog posts.");
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) return sendErrorResponse(res, STATUS.NOT_FOUND, "Post not found.");
    return sendSuccessResponse(res, STATUS.OK, "Blog post fetched.", post, "post");
  } catch (error) {
    console.error("Get Blog Post Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch blog post.");
  }
};
