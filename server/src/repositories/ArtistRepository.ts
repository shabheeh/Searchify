import { CreateArtistDTO, IArtist } from "@/types/Artist";
import { IArtistRepository } from "./interfaces/IArtistRepository";
import { ArtistModel } from "@/models/Artist";
import { logger } from "@/utils/logger";

export class ArtistRepository implements IArtistRepository {
  async create(artistData: CreateArtistDTO): Promise<IArtist> {
    try {
      const artist = new ArtistModel(artistData);
      const savedArtist = await artist.save();
      return savedArtist;
    } catch (error: unknown) {
      logger.error("Error creating artis", error);
      throw error;
    }
  }

  async bulkCreate(artists: CreateArtistDTO[]): Promise<IArtist[]> {
    try {
      const savedArtists = await ArtistModel.insertMany(artists, {
        ordered: false,
        rawResult: false,
      });

      return savedArtists;
    } catch (error: unknown) {
      logger.error("Error in bulk create artists:", error);
      throw error;
    }
  }
  async getStats(): Promise<any> {
    try {
      const stats = await ArtistModel.aggregate([
        {
          $group: {
            _id: null,
            totalArtists: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      return (
        stats[0] || {
          totalArtists: 0,
        }
      );
    } catch (error) {
      logger.error("Error getting artist stats:", error);
      throw error;
    }
  }
}
