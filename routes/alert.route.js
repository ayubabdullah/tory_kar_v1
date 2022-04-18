const express = require("express");
const {
  getAlerts,
  addAlert,
  deleteAlert,
} = require("../controllers/alert.controller");
const router = express.Router({ mergeParams: true });

const { protect } = require("../middlewares/authHandler");

router.use(protect);

router.route("/").get(getAlerts).post(addAlert);

router.route("/:id").delete(deleteAlert);

module.exports = router;
