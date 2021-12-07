const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
//const geocoder = require("../utils/geocoder");
const JobProvider = require("../models/JobProvider");
const { unlink } = require("fs");
const JobSeeker = require("../models/JobSeeker");
const User = require("../models/User");

// @desc      Get all jobProviders
// @route     GET /api/v1/jobproviders
// @access    Public
exports.getJobProviders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single jobProvider
// @route     GET /api/v1/jobproviders/:id
// @access    Public
exports.getJobProvider = asyncHandler(async (req, res, next) => {
  const jobProvider = await JobProvider.findById(req.params.id).populate([
    "jobs",
    "user",
  ]);

  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `JobProvider not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: jobProvider });
});

// @desc      Create new jobProvider
// @route     POST /api/v1/jobproviders
// @access    Private
exports.createJobProvider = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // Check for user account
  if (!user) {
    return next(
      new ErrorResponse(`The user with ID ${req.user.id} doesn't exist`, 400)
    );
  }
  // Check is user account verified
  if (!user.isVerified) {
    return next(
      new ErrorResponse(`The user with ID ${req.user.id} not verified yet`, 400)
    );
  }
  const jobSeeker = await JobSeeker.findOne({ user: req.user.id });

  if (jobSeeker) {
    return next(
      new ErrorResponse(`User with id: ${req.user.id} is a jobSeeker`, 404)
    );
  }
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existed jobProvider
  const existedJobProvider = await JobProvider.findOne({ user: req.user.id });

  // only one jobProvider can exist
  if (existedJobProvider) {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already a jobProvider`,
        400
      )
    );
  }

  const jobProvider = await JobProvider.create(req.body);
  if (jobProvider.email) {
    user.email = jobProvider.email;
    await user.save();
  }
  res.status(201).json({
    success: true,
    data: jobProvider,
  });
});

// @desc      Update jobProvider
// @route     PUT /api/v1/jobproviders/:id
// @access    Private
exports.updateJobProvider = asyncHandler(async (req, res, next) => {
  let jobProvider = await JobProvider.findById(req.params.id);

  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `JobProvider not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is jobProvider owner
  if (
    jobProvider.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this jobProvider`,
        401
      )
    );
  }

  jobProvider = await JobProvider.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: jobProvider });
});

// @desc      Delete jobProvider
// @route     DELETE /api/v1/jobproviders/:id
// @access    Private
exports.deleteJobProvider = asyncHandler(async (req, res, next) => {
  const jobProvider = await JobProvider.findById(req.params.id);

  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `JobProvider not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is jobProvider owner
  if (
    jobProvider.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this jobProvider`,
        401
      )
    );
  }

  unlink(
    `${process.env.FILE_UPLOAD_PATH}/${jobProvider.profileImage}`,
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("image removed from upload folder");
    }
  );

  await jobProvider.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photo for jobProvider
// @route     PUT /api/v1/jobproviders/:id/photo
// @access    Private
exports.jobProviderPhotoUpload = asyncHandler(async (req, res, next) => {
  const jobProvider = await JobProvider.findById(req.params.id);

  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `JobProvider not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is jobProvider owner
  if (
    jobProvider.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this jobProvider`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${jobProvider._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await JobProvider.findByIdAndUpdate(req.params.id, {
      profileImage: file.name,
    });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc      Approve jobProvider
// @route     PUT /api/v1/jobproviders/:id/approve
// @access    Private
exports.approveJobProvider = asyncHandler(async (req, res, next) => {
  let jobProvider = await JobProvider.findById(req.params.id);

  if (!jobProvider) {
    return next(
      new ErrorResponse(
        `JobProvider not found with id of ${req.params.id}`,
        404
      )
    );
  }

  await JobProvider.findByIdAndUpdate(req.params.id, { isApproved: true });

  res
    .status(200)
    .json({ success: true, data: `jobProvider ${req.params.id} is approved` });
});
