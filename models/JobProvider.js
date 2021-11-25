const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const JobProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    dateOfStartup: {
      type: Date,
      required: [true, "Please add your date of startup"],
    },
    fields: {
      type: [String],
      required: [true, "Please add a field"],
    },
    bio: {
      type: String,
      required: [true, "Please add a bio"],
      maxlength: [100, "bio can not be more than 100 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    companyDescription: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "description can not be more than 500 characters"],
    },
    profileImage: {
      type: String,
      required: [true, "Please add a photo"],
      defualt: "no-image.jpg",
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
JobProviderSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
JobProviderSchema.pre("save", async function (next) {
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

// Cascade delete provided job when a jobprovider is deleted
JobProviderSchema.pre("remove", async function (next) {
  console.log(`provided job being removed from jobprovider ${this._id}`);
  await this.model("Job").deleteMany({ jobProvider: this._id });
  next();
});

// Reverse populate with virtuals
JobProviderSchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "jobProvider",
  justOne: false,
});

module.exports = mongoose.model("JobProvider", JobProviderSchema);
