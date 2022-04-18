const mongoose = require("mongoose");


const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add an alert title"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  jobSeeker: {
    type: mongoose.Schema.ObjectId,
    ref: "JobSeeker",
    required: true,
  },
});

module.exports = mongoose.model("Alert", AlertSchema);
