const express = require("express");
const {
  getJobProviders,
  getJobProvider,
  createJobProvider,
  updateJobProvider,
  deleteJobProvider,
  jobProviderPhotoUpload,
  approveJobProvider,
} = require("../controllers/jobProvider.controller");

const JobProvider = require("../models/JobProvider");

// Include other resource routers
const jobRouter = require("./job.route");

const router = express.Router();

const advancedResults = require("../middlewares/advancedResults");
const { protect, authorize } = require("../middlewares/authHandler");

// Re-route into other resource routers
router.use("/:jobProviderId/jobs", jobRouter);

router
  .route("/:id/photo")
  .put(protect, authorize("jobProvider", "admin"), jobProviderPhotoUpload);
router
  .route("/:id/approve")
  .put(protect, authorize("admin"), approveJobProvider);
router
  .route("/")
  .get(advancedResults(JobProvider, ["jobs", "user"]), getJobProviders)
  .post(protect, authorize("jobProvider", "admin"), createJobProvider);

router
  .route("/:id")
  .get(getJobProvider)
  .put(protect, authorize("jobProvider", "admin"), updateJobProvider)
  .delete(protect, authorize("jobProvider", "admin"), deleteJobProvider);

module.exports = router;
