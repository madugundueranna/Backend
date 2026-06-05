const express = require("express");
const router = express.Router();
const { getContactInfo } = require("../../Controllers/Content/ContactInfoController");

router.get("/contact-info", getContactInfo);

module.exports = router;
