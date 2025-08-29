import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectMongoDB = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    await mongoose.connect(process.env.MONGODB_URI!, options);
    console.log("Mongodb connecton successful");

    mongoose.connection.on("error", (error) => {
      console.log("Mongodb connections error", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("mongodb disconnected");
    });
  } catch (error) {
    console.error("Failed to connect mongodb", error);
    process.exit(1);
  }
};

export const disconnectMongodDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("mongodb disconnectecd");
  } catch (error) {
    console.error("Error disconnecting from mongodb", error);
  }
};
