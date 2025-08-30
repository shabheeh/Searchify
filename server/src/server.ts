import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import config from "./configs/environment";
import { Server as HttpServer } from "http";
import { connectMongoDB } from "./configs/database";
import { logger } from "./utils/logger";
import { httpLogger } from "./middlewares/httpLogger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { elasticsearchConfig } from "./configs/elasticsearch";
import { artistRouter } from "./routes/artistRoutes";

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
    this.app.use(
      cors({
        origin: config.CORS_ORIGIN,
        credentials: true,
      })
    );
    this.app.use(httpLogger);
    this.app.use(compression());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes(): void {
    this.app.get("/health", async (req: Request, res: Response) => {
      try {
        const [esHealth] = await Promise.allSettled([
          elasticsearchConfig.checkConnection(),
        ]);

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

    this.app.use("/api", artistRouter);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await connectMongoDB();
      const server = this.app.listen(config.PORT, "0.0.0.0", () => {
        logger.info(`Server running on port ${config.PORT}`);
      });

      this.setupGracefulShutdown(server);
    } catch (error) {
      logger.error("failed to start server", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(server: HttpServer): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Graceful shutdown...`);

      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }
}

if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
