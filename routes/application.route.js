const express = require("express");
const {
  getApplications,
  getApplication,
  addApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/application.controller");

const Application = require("../models/Application");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middlewares/advancedResults");
const { protect } = require("../middlewares/authHandler");
router.use(protect);
router
  .route("/")
  .get(
    advancedResults(Application, {
      path: "jobSeeker",
      select: "name",
    }),
    getApplications
  )
  .post(authorize("jobSeeker"), addApplication);

router
  .route("/:id")
  .get(getApplication)
  .put(authorize("jobSeeker"), updateApplication)
  .delete(authorize("jobSeeker"), deleteApplication);

module.exports = router;
