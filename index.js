const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/databse.js");
const cloudinary = require("cloudinary");

//Uncaught Handlig
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("server is Shutting down due to Uncaught Exception");
  // process.exist(1);
  process.exit?.(1);
});

//Config
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.listen(process.env.PORT, () => {
  console.log(`listning on port ${process.env.PORT}`);
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("server is Shutting down due to Unhandled Promise Rejection");

  index.close(() => {
    process.exist?.(1);
  });
});
