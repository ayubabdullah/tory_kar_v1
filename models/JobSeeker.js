const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const JobSeekerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    dateOfBirth: {
      type: Date,
      required: [true, "Please add your date of birth"],
      default: Date.now,
    },
    gendar: {
      type: String,
      required: [true, "Please add your gender"],
      enum: ["male", "female"],
    },
    bio: {
      type: String,
      required: [true, "Please add a bio"],
      maxlength: [500, "bio can not be more than 500 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    skills: {
      type: String,
      required: [true, "Please add at least one skill"],
    },
    languages: {
      type: [String],
      required: [true, "Please add at least one language"],
    },
    profileImage: {
      type: String,
      required: [true, "Please add a photo"],
      defualt: "no-image.jpg",
    },
    CVs: {
      type: [String],
      required: [true, "Please add at least one cv"],
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
      country: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create bootcamp slug from the name
JobSeekerSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
JobSeekerSchema.pre("save", async function (next) {
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

// Cascade delete applications when a jobseeker is deleted
JobSeekerSchema.pre("remove", async function (next) {
  console.log(`applications being removed from jobseeker ${this._id}`);
  await this.model("Application").deleteMany({ jobSeeker: this._id });
  next();
});

// Reverse populate with virtuals
JobSeekerSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobSeeker",
  justOne: false,
});

// Reverse populate with virtuals
JobSeekerSchema.virtual("alerts", {
  ref: "Alert",
  localField: "_id",
  foreignField: "jobSeeker",
  justOne: false,
});

module.exports = mongoose.model("JobSeeker", JobSeekerSchema);
