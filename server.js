const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

const app = express();

// Connect to database
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    const server = app.listen(
      PORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
  })
  .catch((err) => console.log(err));

// Route files
// const bootcamps = require("./routes/bootcamps");
// const courses = require("./routes/courses");
const auth = require("./routes/auth.route");
 const jobSeeker = require("./routes/jobSeeker.route");
 const jobProvider = require("./routes/jobProvider.route");
 const application = require("./routes/application.route");
 const job = require("./routes/job.route");
 const alert = require("./routes/alert.route");
 const notification = require("./routes/notification.route");

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
// app.use("/api/v1/bootcamps", bootcamps);
// app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
 app.use("/api/v1/jobseekers", jobSeeker);
 app.use("/api/v1/jobproviders", jobProvider);
 app.use("/api/v1/applications", application);
 app.use("/api/v1/jobs", job);
 app.use("/api/v1/alerts", alert);
 app.use("/api/v1/notifications", notification);

app.use(errorHandler);
