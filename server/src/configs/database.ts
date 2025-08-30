import mongoose, { ConnectOptions } from "mongoose";
import config from "./environment";
import { logger } from "@/utils/logger";

export const connectMongoDB = async (): Promise<void> => {
  try {
    const options: ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
    };

    await mongoose.connect(config.MONGODB_URI, options);
    logger.info("Mongodb connecton successful");

    mongoose.connection.on("error", (error) => {
      logger.error("Mongodb connections error", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("mongodb disconnected");
    });
  } catch (error) {
    logger.error("Failed to connect mongodb", error);
    process.exit(1);
  }
};

export const disconnectMongodDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("mongodb disconnectecd");
  } catch (error) {
    logger.error("Error disconnecting from mongodb", error);
  }
};
