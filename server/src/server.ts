import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
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

  public async start(): Promise<void> {
    try {
        this.app.listen(5000, () => {
            console.log("Server running on port 5000")
        })
    } catch (error) {
        console.log("failed to start server", error);
        process.exit(1)
    }
  }
}

if (require.main === module) {
    const server = new Server();
    server.start();
}

export default Server;


