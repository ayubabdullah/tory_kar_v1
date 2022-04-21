const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const JobProvider = require("../models/JobProvider");
const Job = require("../models/Job");
const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { addNotification } = require("./notification.controller");

// @desc      Get jobs
// @route     GET /api/v1/jobs
// @route     GET /api/v1/jobproviders/:jobProviderId/jobs
// @access    Public
exports.getJobs = asyncHandler(async (req, res, next) => {
  if (req.params.jobProviderId) {
    const jobProvider = await JobProvider.findById(req.params.jobProviderId);

    if (!jobProvider) {
      return next(
        new ErrorResponse(
          `No jobProvider with the id of ${req.params.jobProviderId}`,
          404
        )
      );
    }
    const jobs = await Job.find({
      jobProvider: req.params.jobProviderId,
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single job
// @route     GET /api/v1/jobs/:id
// @access    Public
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate({
    path: "jobProvider",
    select: "name",
  });

  if (!job) {
    return next(
      new ErrorResponse(`No job with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

// @desc      Add job
// @route     POST /api/v1/jobproviders/:jobProviderId/jobs
// @access    Private
exports.addJob = asyncHandler(async (req, res, next) => {
  const jobProvider = await JobProvider.findById(req.params.jobProviderId);
  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `No jobProvider with the id of ${req.params.jobProviderId}`,
        404
      )
    );
  }
  req.body.jobProvider = req.params.jobProviderId;
  req.body.address = jobProvider.address;

  const job = await Job.create(req.body);

  const alerts = await Alert.find({ title: job.title });
  alerts.forEach(alert => {
    addNotification(alert.jobSeeker, job._id)
  })

  res.status(200).json({
    success: true,
    data: job,
  });
});

// @desc      Update job
// @route     PUT /api/v1/jobs/:id
// @access    Private
exports.updateJob = asyncHandler(async (req, res, next) => {
  const jobProvider = await JobProvider.findOne({ user: req.user.id });
  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `No jobProvider with the id of ${req.params.jobProviderId}`,
        404
      )
    );
  }
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(
      new ErrorResponse(`No job with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is job owner
  if (
    !(job.jobProvider.toString() !== jobProvider._id &&
    req.user.role !== "admin")
  ) {
    return next(
      new ErrorResponse(
        `User ${jobProvider._id} is not authorized to update job ${job._id}`,
        401
      )
    );
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  job.save();

  res.status(200).json({
    success: true,
    data: job,
  });
});

// @desc      Delete job
// @route     DELETE /api/v1/jobs/:id
// @access    Private
exports.deleteJob = asyncHandler(async (req, res, next) => {
  // const jobProvider = await JobProvider.findOne({ user: req.user.id });
  // if (!jobProvider) {
  //   return next(
  //     new ErrorResponse(`No jobProvider with the id of ${req.user.id}`, 404)
  //   );
  // }
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(
      new ErrorResponse(`No job with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is job owner
  // if (
  //   job.jobProvider.toString() !== jobProvider._id ||
  //   req.user.role !== "admin"
  // ) {
  //   return next(
  //     new ErrorResponse(
  //       `User ${jobProvider._id} is not authorized to delete job ${job._id}`,
  //       401
  //     )
  //   );
  // }

  await job.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
