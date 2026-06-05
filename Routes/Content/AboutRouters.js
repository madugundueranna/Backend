const express = require("express");
const router = express.Router();
const { getAbout } = require("../../Controllers/Content/AboutController");

router.get("/about-content", getAbout);

module.exports = router;
