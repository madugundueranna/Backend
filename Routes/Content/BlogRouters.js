const express = require("express");
const router = express.Router();
const { getPosts, getPostBySlug } = require("../../Controllers/Content/BlogController");

router.get("/blog-posts", getPosts);
router.get("/blog-posts/:slug", getPostBySlug);

module.exports = router;
