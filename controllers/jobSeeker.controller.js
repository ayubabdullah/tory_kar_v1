const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
//const geocoder = require("../utils/geocoder");
const JobSeeker = require("../models/JobSeeker");
const { unlink } = require("fs");

// @desc      Get all jobSeekers
// @route     GET /api/v1/jobseekers
// @access    Public
exports.getJobSeekers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single jobSeeker
// @route     GET /api/v1/jobseekers/:id
// @access    Public
exports.getJobSeeker = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findById(req.params.id);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(`JobSeeker not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: jobSeeker });
});

// @desc      Create new jobSeeker
// @route     POST /api/v1/jobseekers
// @access    Private
exports.createJobSeeker = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existed jobSeeker
  const existedJobSeeker = await JobSeeker.findOne({ user: req.user.id });

  // only one jobSeeker can exist
  if (existedJobSeeker) {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already a jobSeeker`,
        400
      )
    );
  }

  const jobSeeker = await JobSeeker.create(req.body);

  res.status(201).json({
    success: true,
    data: jobSeeker,
  });
});

// @desc      Update jobSeeker
// @route     PUT /api/v1/jobseekers/:id
// @access    Private
exports.updateJobSeeker = asyncHandler(async (req, res, next) => {
  let jobSeeker = await JobSeeker.findById(req.params.id);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(`JobSeeker not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is jobSeeker owner
  if (jobSeeker.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this jobSeeker`,
        401
      )
    );
  }

  jobSeeker = await JobSeeker.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: jobSeeker });
});

// @desc      Delete jobSeeker
// @route     DELETE /api/v1/jobseekers/:id
// @access    Private
exports.deleteJobSeeker = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findById(req.params.id);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(`JobSeeker not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is jobSeeker owner
  if (jobSeeker.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this jobSeeker`,
        401
      )
    );
  }

  unlink(`${process.env.FILE_UPLOAD_PATH}/${jobSeeker.profileImage}`, (err) => {
    if (err) {
      console.error(err);
      return;
      }
      console.log('image removed from upload folder')
  });

  await jobSeeker.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photo for jobSeeker
// @route     PUT /api/v1/jobseekers/:id/photo
// @access    Private
exports.jobSeekerPhotoUpload = asyncHandler(async (req, res, next) => {
  const jobSeeker = await JobSeeker.findById(req.params.id);

  if (!jobSeeker) {
    return next(
      new ErrorResponse(`JobSeeker not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is jobSeeker owner
  if (jobSeeker.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this jobSeeker`,
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
  file.name = `photo_${jobSeeker._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await JobSeeker.findByIdAndUpdate(req.params.id, {
      profileImage: file.name,
    });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
