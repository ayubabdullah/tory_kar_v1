const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const JobSeeker = require("../models/JobSeeker");
const Job = require("../models/Job");

// @desc      Get applications
// @route     GET /api/v1/applications
// @route     GET /api/v1/jobseekers/:jobSeekerId/applications
// @access    Public
exports.getApplications = asyncHandler(async (req, res, next) => {
  if (req.params.jobSeekerId) {
    const jobSeeker = await JobSeeker.findById(req.params.jobSeekerId);

    if (!jobSeeker) {
      return next(
        new ErrorResponse(
          `No jobSeeker with the id of ${req.params.jobSeekerId}`,
          404
        )
      );
    }
    
    const applications = await Application.find({
      jobSeeker: req.params.jobSeekerId,
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single application
// @route     GET /api/v1/applications/:id
// @access    Public
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id).populate({
    path: "jobSeeker",
    select: "name",
  });

  if (!application) {
    return next(
      new ErrorResponse(`No application with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

// @desc      Add application
// @route     POST /api/v1/jobs/jobId/applications
// @access    Private
exports.addApplication = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({user: req.user.id});

  if (!jobSeeker) {
    return next(
      new ErrorResponse(
        `No jobSeeker with the id of ${req.user.id}`,
        404
      )
    );
  }
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    return next(
      new ErrorResponse(
        `No job with the id of ${req.params.jobId}`,
        404
      )
    );
  }

  req.body.jobSeeker = jobSeeker._id;
  req.body.job = req.params.jobId;

  const application = await Application.create(req.body);

  res.status(200).json({
    success: true,
    data: application,
  });
});

// @desc      Update application
// @route     PUT /api/v1/applications/:id
// @access    Private
exports.updateApplication = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });
  if (!jobSeeker) {
    return next(
      new ErrorResponse(
        `No jobSeeker with the id of ${req.params.jobSeekerId}`,
        404
      )
    );
  }
  let application = await Application.findById(req.params.id);

  if (!application) {
    return next(
      new ErrorResponse(`No application with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is application owner
  if (
    application.jobSeeker.toString() !== jobSeeker.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${jobSeeker.id} is not authorized to update application ${application._id}`,
        401
      )
    );
  }

  application = await Application.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  application.save();

  res.status(200).json({
    success: true,
    data: application,
  });
});

// @desc      Delete application
// @route     DELETE /api/v1/applications/:id
// @access    Private
exports.deleteApplication = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });
  if (!jobSeeker) {
    return next(
      new ErrorResponse(`No jobSeeker with the id of ${req.user.id}`, 404)
    );
  }
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(
      new ErrorResponse(`No application with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is application owner
  if (
    application.jobSeeker.toString() !== jobSeeker._id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${jobSeeker._id} is not authorized to delete application ${application._id}`,
        401
      )
    );
  }

  await application.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
