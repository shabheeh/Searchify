import ArtistService from "@/services/ArtistService";
import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

export class ArtistController {
  async getArtist(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Artist ID is required",
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const artist = await ArtistService.getArtistById(id);

      if (!artist) {
        res.status(404).json({
          success: false,
          error: "Artist not found",
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: artist,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      logger.error("Error getting artist:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get artist",
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }
    

      const startTime = Date.now();
      const results = await ArtistService.searchArtists(q);
      const searchTime = Date.now() - startTime;

      const response: ApiResponse = {
        success: true,
        data: {
          data: results.artists,
        },
        message: `Found ${results.total} artists in ${searchTime}ms`,
        timestamp: new Date().toISOString(),
      };

      logger.info("Search performed", {
        query: q,
        resultsCount: results.total,
        searchTime,
      });

      res.json(response);
    } catch (error: any) {
      logger.error("Search error:", error);
      res.status(500).json({
        success: false,
        error: "Search failed",
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }

  async suggest(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = '10' } = req.query;

      if (!q || typeof q !== 'string') {
        res.json({
          success: true,
          data: [],
          timestamp: new Date().toISOString()
        } as ApiResponse);
        return;
      }

      if (q.length < 2) {
        res.json({
          success: true,
          data: [],
          timestamp: new Date().toISOString()
        } as ApiResponse);
        return;
      }

      const limitNum = Math.min(20, Math.max(1, parseInt(limit as string) || 10));
      const suggestions = await ArtistService.getSuggestions(q, limitNum);

      res.json({
        success: true,
        data: suggestions,
        message: `Found ${suggestions.length} suggestions`,
        timestamp: new Date().toISOString()
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Suggestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions',
        timestamp: new Date().toISOString()
      } as ApiResponse);
    }
  }

  
}
