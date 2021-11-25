const express = require("express");
const {
  getJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
  getJobsInRadius,
} = require("../controllers/job.controller");

const Job = require("../models/Job");

// Include other resource routers
const applicationRouter = require("./application.route");
const router = express.Router({ mergeParams: true });

const advancedResults = require("../middlewares/advancedResults");
const { protect } = require("../middlewares/authHandler");

// Re-route into other resource routers
router.use("/:jobId/applications", applicationRouter);

router.route("/radius/:lat/:lng/:distance").get(getJobsInRadius);

router
  .route("/")
  .get(
    advancedResults(Job, {
      path: "jobProvider",
      select: "name",
    }),
    getJobs
  )
  .post(protect, addJob);

router
  .route("/:id")
  .get(getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

module.exports = router;
