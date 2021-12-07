const express = require("express");
const {
  getJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
} = require("../controllers/job.controller");

const Job = require("../models/Job");

// Include other resource routers
const applicationRouter = require("./application.route");
const router = express.Router({ mergeParams: true });

const advancedResults = require("../middlewares/advancedResults");
const { protect, authorize } = require("../middlewares/authHandler");

// Re-route into other resource routers
router.use("/:jobId/applications", applicationRouter);

router
  .route("/")
  .get(
    advancedResults(Job, {
      path: "jobProvider",
      select: "name",
    }),
    getJobs
  )
  .post(protect, authorize("jobProvider", "admin"), addJob);

router
  .route("/:id")
  .get(getJob)
  .put(protect, authorize("jobProvider", "admin"), updateJob)
  .delete(protect, authorize("jobProvider", "admin"), deleteJob);

module.exports = router;
