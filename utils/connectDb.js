import mongoose from "mongoose";




export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection successful to DB");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exiting with a non-zero code indicates failure
  }
};
