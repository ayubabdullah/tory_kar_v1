const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const JobSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please add a job name"],
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
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    state: String,
    country: String,
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

// Geocode & create location field
JobSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    state: loc[0].stateCode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

module.exports = mongoose.model("Job", JobSchema);
