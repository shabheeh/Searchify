import config from "@/configs/environment";
import { logger } from "@/utils/logger";
import morgan, { StreamOptions } from "morgan";

const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
};

const format = config.NODE_ENV === "production" ? "combined" : "dev";

export const httpLogger = morgan(format, { stream });
