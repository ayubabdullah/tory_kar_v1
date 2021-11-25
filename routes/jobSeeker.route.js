const express = require("express");
const {
  getJobSeekers,
  getJobSeeker,
  createJobSeeker,
  updateJobSeeker,
  deleteJobSeeker,
  jobSeekerPhotoUpload,
} = require("../controllers/jobSeeker.controller");

const JobSeeker = require("../models/JobSeeker");

// Include other resource routers
 const applicationRouter = require("./application.route");
// const reviewRouter = require("./reviews");

const router = express.Router();

const advancedResults = require("../middlewares/advancedResults");
const { protect } = require("../middlewares/authHandler");

// Re-route into other resource routers
 router.use("/:jobId/applications", applicationRouter);
// router.use("/:bootcampId/reviews", reviewRouter);


router.route("/:id/photo").put(protect, jobSeekerPhotoUpload);

router
  .route("/")
  .get(advancedResults(JobSeeker, 'applications'), getJobSeekers)
  .post(protect, createJobSeeker);

router
  .route("/:id")
  .get(getJobSeeker)
  .put(protect, updateJobSeeker)
  .delete(protect, deleteJobSeeker);

module.exports = router;
