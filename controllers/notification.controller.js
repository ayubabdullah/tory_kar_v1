const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const JobSeeker = require("../models/JobSeeker");
const Job = require("../models/Job");

// @desc      Get jobSeeker Notifications
// @route     GET /api/v1/jobseekers/:jobSeekerId/notifications
// @access    Public
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findById(req.params.jobSeekerId);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(
        `No jobSeeker with the id of ${req.params.jobSeekerId}`,
        404
      )
    );
  }

  const notifications = await Notification.find({
    jobSeeker: req.params.jobSeekerId,
  });

  return res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc      Delete notification
// @route     DELETE /api/v1/notification/:id
// @access    Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });
  if (!jobSeeker) {
    return next(
      new ErrorResponse(`No jobSeeker with the id of ${req.user.id}`, 404)
    );
  }
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(`No notification with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is notification owner
  if (
    notification.jobSeeker.toString() !== jobSeeker._id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${jobSeeker._id} is not authorized to delete notification ${notification._id}`,
        401
      )
    );
  }

  await notification.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Create notification
exports.addNotification = async(jobSeekerId, jobId) => {
  const jobSeeker = await JobSeeker.findById(jobSeekerId);
  if (!jobSeeker) {
    return next(
      new ErrorResponse(`No jobSeeker with the id of ${jobSeekerId}`, 404)
    );
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorResponse(`No job with the id of ${jobId}`, 404));
  }

  const notification = await Notification.create({
    jobSeeker: jobSeekerId,
    job: jobId,
  });
  console.log(notification);
};
