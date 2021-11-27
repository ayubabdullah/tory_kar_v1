const express = require("express");
const {
  getAlerts,
  addAlert,
  deleteAlert,
} = require("../controllers/alert.controller");
const router = express.Router({ mergeParams: true });

const { protect } = require("../middlewares/authHandler");

router.route("/").get(getAlerts).post(protect, addAlert);

router.route("/:id").delete(protect, deleteAlert);

module.exports = router;
