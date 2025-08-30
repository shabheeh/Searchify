import { ArtistRepository } from "@/repositories/ArtistRepository";
import { IArtistRepository } from "@/repositories/interfaces/IArtistRepository";
import { ISearchRepository } from "@/repositories/interfaces/ISearchRepository";
import { SearchRepository } from "@/repositories/SearchRepository";
import { CreateArtistDTO, IArtist, SearchResponse } from "@/types/Artist";
import { logger } from "@/utils/logger";

export class ArtistService {
  constructor(
    private artistRepository: IArtistRepository,
    private searchRepository: ISearchRepository
  ) {}

  async createArtist(artistData: CreateArtistDTO): Promise<IArtist> {
    try {
      const artist = await this.artistRepository.create(artistData);
      await this.searchRepository.indexArtist(artist);
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
      logger.error("Error getting artist stats:", error);
      throw error;
    }
  }

  async getArtistById(id: string): Promise<IArtist | null> {
    try {
      return await this.artistRepository.findById(id);
    } catch (error) {
      logger.error("Error getting artist by ID:", error);
      throw error;
    }
  }

  async searchArtists(query: string): Promise<SearchResponse> {
    try {

      return await this.searchRepository.search(query);
    } catch (error) {
      logger.error("Error searching artists:", error);
      throw error;
    }
  }

  async getSuggestions(query: string, limit: number = 10): Promise<IArtist[]> {
    try {
      return await this.searchRepository.suggest(query, limit);
    } catch (error) {
      logger.error("Error getting suggestions:", error);

      throw error;
    }
  }
}

const artistRepository = new ArtistRepository();
const searchRepository = new SearchRepository();
export default new ArtistService(artistRepository, searchRepository);
