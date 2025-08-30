import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import config from "./configs/environment";

import { connectMongoDB } from "./configs/database";
import { logger } from "./utils/logger";
import { httpLogger } from "./middlewares/httpLogger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(httpLogger)
    this.app.use(compression());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes(): void {
    this.app.get("/health", async (req: Request, res: Response) => {
      try {
        res.status(200).json({
          success: true,
          data: {
            server: "healthy",
            timestamp: new Date().toISOString(),
            mongodb: "connected",
            uptime: process.uptime(),
          },
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          error: "service unavailabe",
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler)
  }

  public async start(): Promise<void> {
    try {
      await connectMongoDB();
      this.app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`);
      });
    } catch (error) {
      logger.error("failed to start server", error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
