const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const Alert = require("../models/Alert");
const JobSeeker = require("../models/JobSeeker");

// @desc      Get jobSeeker Alerts
// @route     GET /api/v1/jobseekers/:jobSeekerId/alert
// @access    Public
exports.getAlerts = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findById(req.params.jobSeekerId);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(
        `No jobSeeker with the id of ${req.params.jobSeekerId}`,
        404
      )
    );
  }

  const alerts = await Alert.find({
    jobSeeker: req.params.jobSeekerId,
  });

  return res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
});

// @desc      Add alert
// @route     POST /api/v1/alert
// @access    Private
exports.addAlert = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });

  if (!jobSeeker) {
    return next(
      new ErrorResponse(`No jobSeeker with the id of ${req.user.id}`, 404)
    );
  }

  req.body.jobSeeker = jobSeeker._id;

  const alert = await Alert.create(req.body);

  res.status(200).json({
    success: true,
    data: alert,
  });
});


// @desc      Delete alert
// @route     DELETE /api/v1/alert/:id
// @access    Private
exports.deleteAlert = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });
  if (!jobSeeker) {
    return next(
      new ErrorResponse(`No jobSeeker with the id of ${req.user.id}`, 404)
    );
  }
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(
      new ErrorResponse(`No alert with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is alert owner
  if (
    alert.jobSeeker.toString() !== jobSeeker._id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${jobSeeker._id} is not authorized to delete alert ${application._id}`,
        401
      )
    );
  }

  await alert.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
