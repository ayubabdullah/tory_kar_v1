const express = require("express");
const {
  getNotifications,
  deleteNotification,
} = require("../controllers/notification.controller");
const router = express.Router({ mergeParams: true });

const { protect } = require("../middlewares/authHandler");

router.route("/").get(getNotifications);

router.route("/:id").delete(protect, deleteNotification);

module.exports = router;
