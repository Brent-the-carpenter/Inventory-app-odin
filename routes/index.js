const express = require("express");
const router = express.Router();
const store_controller = require("../controllers/storeController");
/* GET home page. */
router.get("/", store_controller.index);

module.exports = router;
