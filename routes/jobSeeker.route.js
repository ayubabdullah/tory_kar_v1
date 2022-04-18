const express = require("express");
const {
  getJobSeekers,
  getJobSeeker,
  createJobSeeker,
  updateJobSeeker,
  deleteJobSeeker,
  jobSeekerPhotoUpload,
  jobSeekerCvUpload,
  deleteJobSeekerCv,
} = require("../controllers/jobSeeker.controller");

const JobSeeker = require("../models/JobSeeker");

// Include other resource routers
 const applicationRouter = require("./application.route");
 const alertRouter = require("./alert.route");
 const notificationRouter = require("./notification.route");

const router = express.Router();

const advancedResults = require("../middlewares/advancedResults");
const { protect, authorize } = require("../middlewares/authHandler");

// Re-route into other resource routers
 router.use("/:jobId/applications", applicationRouter);
 router.use("/:jobSeekerId/alerts", alertRouter);
 router.use("/:jobSeekerId/notifications", notificationRouter);


router
  .route("/:id/photo")
  .put(protect, authorize("jobSeeker", "admin"), jobSeekerPhotoUpload);
router
  .route("/:id/cv")
  .put(protect, authorize("jobSeeker", "admin"), jobSeekerCvUpload);
router
  .route("/:id/cv/:cv")
  .delete(protect, authorize("jobSeeker", "admin"), deleteJobSeekerCv);

router
  .route("/")
  .get(
    advancedResults(JobSeeker, ["applications", "user", "alerts"]),
    getJobSeekers
  )
  .post(protect, authorize("jobSeeker", "admin"), createJobSeeker);

router
  .route("/:id")
  .get(getJobSeeker)
  .put(protect, authorize("jobSeeker", "admin"), updateJobSeeker)
  .delete(protect, authorize("jobSeeker", "admin"), deleteJobSeeker);

module.exports = router;
