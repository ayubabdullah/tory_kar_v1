const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  salary: {
    type: Number,
    required: [true, "Please add a salary"],
  },
  deadline: {
    type: Date,
    required: [true, "Please add a deadline"],
  },
  jobType: {
    type: String,
    required: [true, "Please add a job type"],
    enum: ["fullTime", "partTime"],
    default: "fullTime",
  },
  jobDescription: {
    type: String,
    required: [true, "Please add a job description"],
  },
  jobQualifications: {
    type: String,
    required: [true, "Please add a job qualification"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  jobProvider: {
    type: mongoose.Schema.ObjectId,
    ref: "JobProvider",
    required: true,
  },
});


module.exports = mongoose.model("Job", JobSchema);
