const express = require("express");
const router = express.Router();
const { getCareers } = require("../../Controllers/Content/CareerController");

router.get("/careers", getCareers);

module.exports = router;
