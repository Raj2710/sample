const express = require("express");
const router = express.Router();

const UrlService = require("../Services/url.service");

router.post("/", UrlService.postUrl);
router.get("/", UrlService.urlCount);
router.get("/shorturl/:token", UrlService.redirectUrl);

module.exports = router;


