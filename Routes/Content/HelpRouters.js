const express = require("express");
const router = express.Router();
const { getFAQs } = require("../../Controllers/Content/HelpController");

router.get("/help-faqs", getFAQs);

module.exports = router;
