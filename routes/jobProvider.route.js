const express = require("express");
const {
  getJobProviders,
  getJobProvider,
  createJobProvider,
  updateJobProvider,
  deleteJobProvider,
  jobProviderPhotoUpload,
} = require("../controllers/jobProvider.controller");

const JobProvider = require("../models/JobProvider");

// Include other resource routers
const jobRouter = require("./job.route");

const router = express.Router();

const advancedResults = require("../middlewares/advancedResults");
const { protect } = require("../middlewares/authHandler");

// Re-route into other resource routers
router.use("/:jobProviderId/jobs", jobRouter);


router.route("/:id/photo").put(protect, jobProviderPhotoUpload);

router
  .route("/")
  .get(advancedResults(JobProvider, 'jobs'), getJobProviders)
  .post(protect, createJobProvider);

router
  .route("/:id")
  .get(getJobProvider)
  .put(protect, updateJobProvider)
  .delete(protect, deleteJobProvider);

module.exports = router;
