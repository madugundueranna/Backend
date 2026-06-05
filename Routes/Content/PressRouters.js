const express = require("express");
const router = express.Router();
const { getPress } = require("../../Controllers/Content/PressController");

router.get("/press-items", getPress);

module.exports = router;
