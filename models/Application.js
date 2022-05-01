const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  cv: {
    type: String,
    required: [true, "Please Add a cv"],
  },
  status: {
    type: String,
    required: [true, "Please add a status"],
    enum: ["accept", "reject", "pending"],
    default: "pending",
  },
  rejectReason: {
    type: String,
  },
  meetingDate: {
    type: Date, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: "Job",
    required: true,
  },
  jobSeeker: {
    type: mongoose.Schema.ObjectId,
    ref: "JobSeeker",
    required: true,
  },
});

module.exports = mongoose.model("Application", ApplicationSchema);
