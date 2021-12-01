const express = require("express");
const {
  getNotifications,
  deleteNotification,
} = require("../controllers/notification.controller");
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middlewares/authHandler");
router.use(protect);
router.use(authorize("jobSeeker"));

router.route("/").get(getNotifications);

router.route("/:id").delete(deleteNotification);

module.exports = router;
