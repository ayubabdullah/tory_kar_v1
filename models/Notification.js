const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  jobSeeker: {
    type: mongoose.Schema.ObjectId,
    ref: "JobSeeker",
    required: true,
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: "Job",
    required: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
