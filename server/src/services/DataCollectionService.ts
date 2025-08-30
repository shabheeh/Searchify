import config from "@/configs/environment";
import { CreateArtistDTO, SpotifyArtist } from "@/types/Artist";
import { logger } from "@/utils/logger";
import axios, { AxiosError, AxiosInstance } from "axios";

export class DataCollectionService {
  private spotifyToken: String = "";
  private spotifyApi: AxiosInstance;

  constructor() {
    this.spotifyApi = axios.create({
      baseURL: "https://api.spotify.com/v1",
      timeout: 10000,
    });
  }

  async collectArtists(
    targetCount: number = 100000
  ): Promise<CreateArtistDTO[]> {
    logger.info(`Starting Spotify collection for ${targetCount} artists`);

    const artists = new Map<string, CreateArtistDTO>();

    try {
      await this.getSpotifyToken();
      await this.collectWithAlphabeticalStrategy(artists, targetCount);

      const finalArtists = Array.from(artists.values());
      logger.info(
        `ollection completed. Total unique artists: ${finalArtists.length}`
      );

      return finalArtists;
    } catch (error) {
      logger.error("Error during artist collection:", error);
      throw error;
    }
  }

  private async collectWithAlphabeticalStrategy(
    artists: Map<string, CreateArtistDTO>,
    targetCount: number
  ): Promise<void> {
    logger.info("🔤 Using alphabetical search strategy...");

    const searchPatterns = [
      "a*",
      "b*",
      "c*",
      "d*",
      "e*",
      "f*",
      "g*",
      "h*",
      "i*",
      "j*",
      "k*",
      "l*",
      "m*",
      "n*",
      "o*",
      "p*",
      "q*",
      "r*",
      "s*",
      "t*",
      "u*",
      "v*",
      "w*",
      "x*",
      "y*",
      "z*",

      "aa*",
      "ab*",
      "ac*",
      "ad*",
      "ae*",
      "af*",
      "ag*",
      "ah*",
      "ai*",
      "aj*",
      "ba*",
      "be*",
      "bi*",
      "bl*",
      "bo*",
      "br*",
      "bu*",
      "ca*",
      "ch*",
      "cl*",
      "co*",
      "cr*",
      "da*",
      "de*",
      "di*",
      "do*",
      "dr*",

      "the*",
      "dj*",
      "mc*",
      "lil*",
      "big*",
      "young*",
      "old*",
      "new*",
    ];

    let totalCollected = 0;

    for (const pattern of searchPatterns) {
      if (totalCollected >= targetCount) break;

      logger.info(`Searching pattern: ${pattern}`);

      let offset = 0;
      const limit = 50;
      const maxOffset = 10000;

      while (totalCollected < targetCount && offset < maxOffset) {
        try {
          const response = await this.spotifyApi.get("/search", {
            headers: { Authorization: `Bearer ${this.spotifyToken}` },
            params: {
              q: pattern,
              type: "artist",
              limit,
              offset,
            },
          });

          const spotifyArtists: SpotifyArtist[] = response.data.artists.items;

          if (spotifyArtists.length === 0) break;

          for (const spotifyArtist of spotifyArtists) {
            if (totalCollected >= targetCount) break;

            if (artists.has(spotifyArtist.id)) continue;

            const artist: CreateArtistDTO =
              this.convertSpotifyArtist(spotifyArtist);
            artists.set(spotifyArtist.id, artist);
            totalCollected++;
          }

          offset += limit;

          if (totalCollected % 1000 === 0) {
            logger.info(
              `Pattern ${pattern}: Collected ${totalCollected} total artists...`
            );
          }

          await this.sleep(600);
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              logger.warn("Spotify token expired, refreshing...");
              await this.getSpotifyToken();
              continue;
            }
            if (error.response?.status === 429) {
              logger.warn("Rate limited, waiting 60 seconds...");
              await this.sleep(60000);
              continue;
            }
          }

          logger.error(
            `Error with pattern ${pattern} at offset ${offset}:`,
            error
          );
          break;
        }
      }

      logger.info(
        `Pattern ${pattern} completed. Total collected: ${totalCollected}`
      );
    }

    logger.info(
      `✅ Alphabetical strategy completed: ${totalCollected} unique artists`
    );
  }

  private convertSpotifyArtist(spotifyArtist: SpotifyArtist): CreateArtistDTO {
    const profilePicture =
      spotifyArtist.images && spotifyArtist.images.length > 0
        ? spotifyArtist.images[0].url
        : undefined;

    return {
      name: spotifyArtist.name,
      genres: spotifyArtist.genres || [],
      profilePicture,
      spotifyUrl: spotifyArtist.external_urls?.spotify || "",
    };
  }

  private async getSpotifyToken(): Promise<void> {
    try {
      const auth = Buffer.from(
        `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64");

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.spotifyToken = response.data.access_token;
    } catch (error) {
      logger.error("Failed to get Spotify token:", error);
      throw error;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new DataCollectionService();
