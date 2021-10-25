const express = require("express");
const router = express.Router();
const displayUrlService = require("../Services/displayurl.service");

router.get("/", displayUrlService.getAllUrl);


module.exports = router;