import { ArtistRepository } from "@/repositories/ArtistRepository";
import { IArtistRepository } from "@/repositories/interfaces/IArtistRepository";
import { CreateArtistDTO, IArtist } from "@/types/Artist";
import { logger } from "@/utils/logger";

export class ArtistService {
  constructor(private artistRepository: IArtistRepository) {}

  async createArtist(artistData: CreateArtistDTO): Promise<IArtist> {
    try {
      const artist = await this.artistRepository.create(artistData);

      logger.info("Created artist", artist);
      return artist;
    } catch (error) {
      logger.error("Error creating artist", error);
      throw error;
    }
  }

  async bulkCreateArtists(artists: CreateArtistDTO[]): Promise<IArtist[]> {
    try {
      const savedArtists = await this.artistRepository.bulkCreate(artists);

      logger.info(`Bulk created ${savedArtists.length} artists`);
      return savedArtists;
    } catch (error) {
      logger.error("Error in bulk create artists:", error);
      throw error;
    }
  }

  async getArtistStats(): Promise<any> {
    try {
      return await this.artistRepository.getStats();
    } catch (error) {
      logger.error('Error getting artist stats:', error);
      throw error;
    }
  }
}

const artistRepository = new ArtistRepository();
export default new ArtistService(artistRepository);