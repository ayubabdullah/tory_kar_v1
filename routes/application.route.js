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
const { protect, authorize } = require("../middlewares/authHandler");
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
  .post(authorize("jobSeeker", "admin"), addApplication);

router
  .route("/:id")
  .get(getApplication)
  .put(authorize("jobProvider", "admin"), updateApplication)
  .delete(authorize("jobSeeker", "admin"), deleteApplication);

module.exports = router;
