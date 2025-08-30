import { esClient } from "@/configs/elasticsearch";
import { ISearchRepository } from "./interfaces/ISearchRepository";
import { logger } from "@/utils/logger";
import {
  IndicesStatsResponse,
  SearchRequest,
} from "@elastic/elasticsearch/lib/api/types";
import {
  IArtist,
  SearchResponse as CustomSearchResponse,
  ArtistHit,
} from "@/types/Artist";

export class SearchRepository implements ISearchRepository {
  private readonly indexName = "music_artists";

  private convertToPlainObject(artist: IArtist | any): any {
    if (artist && typeof artist.toObject === "function") {
      return artist.toObject();
    }
    if (artist && typeof artist.toJSON === "function") {
      return artist.toJSON();
    }
    if (artist && typeof artist === "object" && "_doc" in artist) {
      return (artist as any)._doc;
    }
    if (artist && typeof artist === "object" && artist._id && artist.name) {
      return {
        _id: artist._id,
        name: artist.name,
        normalizedName: artist.normalizedName,
        genres: artist.genres || [],
        profilePicture: artist.profilePicture || "",
        spotifyUrl: artist.spotifyUrl || "",
        spotifyId: artist.spotifyId || "",
        createdAt: artist.createdAt,
        updatedAt: artist.updatedAt,
      };
    }
    const extracted = {
      _id: artist?._id,
      name: artist?.name,
      normalizedName: artist?.normalizedName,
      genres: artist?.genres || [],
      profilePicture: artist?.profilePicture || "",
      spotifyUrl: artist?.spotifyUrl || "",
      spotifyId: artist?.spotifyId || "",
      createdAt: artist?.createdAt,
      updatedAt: artist?.updatedAt,
    };
    if (extracted._id && extracted.name) {
      return extracted;
    }
    return artist;
  }

  async createIndex(): Promise<void> {
    try {
      const exists = await esClient.indices.exists({ index: this.indexName });
      if (exists) {
        await esClient.indices.delete({ index: this.indexName });
        logger.info(`Deleted existing index: ${this.indexName}`);
      }
      const indexConfig = {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          max_result_window: 50000,
          analysis: {
            analyzer: {
              artist_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "asciifolding", "edge_ngram_filter"],
              },
              // phonetic_analyzer: {
              //   type: "custom",
              //   tokenizer: "standard",
              //   filter: ["lowercase", "asciifolding", "phonetic_filter"],
              // },
              abbreviation_analyzer: {
                type: "custom",
                tokenizer: "keyword",
                filter: ["lowercase", "asciifolding"],
              },
            },
            filter: {
              edge_ngram_filter: {
                type: "edge_ngram",
                min_gram: 2,
                max_gram: 20,
              },
              // phonetic_filter: {
              //   type: "phonetic",
              //   encoder: "double_metaphone",
              //   replace: false,
              // },
            },
          },
        },
        mappings: {
          properties: {
            name: {
              type: "text" as const,
              analyzer: "artist_analyzer",
              search_analyzer: "standard",
              fields: {
                keyword: { type: "keyword" as const },
                // phonetic: {
                //   type: "text" as const,
                //   analyzer: "phonetic_analyzer",
                //   search_analyzer: "phonetic_analyzer",
                // },
                abbreviation: {
                  type: "text" as const,
                  analyzer: "abbreviation_analyzer",
                },
              },
            },
            suggest: {
              type: "completion" as const,
              analyzer: "simple",
              search_analyzer: "simple",
              max_input_length: 50,
            },
            normalizedName: {
              type: "text" as const,
              fields: {
                keyword: { type: "keyword" as const },
              },
            },
            genres: {
              type: "keyword" as const,
            },
            profilePicture: {
              type: "keyword" as const,
            },
            spotifyUrl: {
              type: "keyword" as const,
            },
            spotifyId: {
              type: "keyword" as const,
            },
            createdAt: {
              type: "date" as const,
            },
            updatedAt: {
              type: "date" as const,
            },
          },
        },
      };
      await esClient.indices.create({
        index: this.indexName,
        ...indexConfig,
      });
      logger.info(`Index ${this.indexName} created successfully`);
    } catch (error) {
      logger.error("Error creating Elasticsearch index:", error);
      throw error;
    }
  }

  async indexArtist(artist: IArtist | any): Promise<void> {
    try {
      const plainArtist = this.convertToPlainObject(artist);
      const esArtist = {
        ...plainArtist,
        suggest: {
          input: this.generateSuggestions(plainArtist.name),
        },
      };
      await esClient.index({
        index: this.indexName,
        id: plainArtist._id.toString(),
        document: esArtist,
      });
      logger.debug(`Indexed artist: ${plainArtist.name}`);
    } catch (error) {
      logger.error(`Error indexing artist ${artist.name}:`, error);
      throw error;
    }
  }

  async bulkIndexArtists(artists: (IArtist | any)[]): Promise<void> {
    if (artists.length === 0) return;
    try {
      const operations = [];
      for (const artist of artists) {
        const plainArtist = this.convertToPlainObject(artist);
        if (!plainArtist || !plainArtist._id || !plainArtist.name) {
          continue;
        }
        const esArtist = {
          id: plainArtist.id,
          name: plainArtist.name,
          normalizedName: plainArtist.normalizedName,
          genres: plainArtist.genres || [],
          profilePicture: plainArtist.profilePicture || "",
          spotifyUrl: plainArtist.spotifyUrl || "",
          spotifyId: plainArtist.spotifyId || "",
          createdAt: plainArtist.createdAt,
          updatedAt: plainArtist.updatedAt,
          suggest: {
            input: this.generateSuggestions(plainArtist.name),
          },
        };
        operations.push({
          index: {
            _index: this.indexName,
            _id: plainArtist._id.toString(),
          },
        });
        operations.push(esArtist);
      }
      if (operations.length === 0) {
        throw new Error("No valid artists to index");
      }
      let response;
      try {
        response = await esClient.bulk({
          operations: operations,
          refresh: true,
        });
      } catch {
        response = await esClient.bulk({
          body: operations,
          refresh: true,
        });
      }
      if (response.errors) {
        const errorItems =
          response.items?.filter(
            (item: any) =>
              item.index?.error ||
              item.create?.error ||
              item.update?.error ||
              item.delete?.error
          ) || [];
        if (errorItems.length === response.items?.length) {
          throw new Error(
            `Bulk indexing failed for all ${errorItems.length} items`
          );
        }
      }
      logger.info(`Bulk indexed ${artists.length} artists successfully`);
      setTimeout(async () => {
        try {
          await esClient.search({
            index: this.indexName,
            query: { match_all: {} },
            size: 1,
          });
        } catch {}
      }, 1000);
    } catch (error) {
      logger.error("Error bulk indexing artists:", error);
      throw error;
    }
  }

  async search(
    query: string,
    limit: number = 20
  ): Promise<CustomSearchResponse> {
    try {
      if (!query || query.trim().length === 0) {
        return {
          artists: [],
          total: 0,
          took: 0,
          aggregations: {},
        };
      }
      const cleanQuery = query.trim();
      const searchRequest: SearchRequest = {
        index: this.indexName,
        query: {
          bool: {
            should: [
              {
                match: {
                  "name.keyword": {
                    query: cleanQuery,
                    boost: 10.0,
                  },
                },
              },
              {
                match: {
                  name: {
                    query: cleanQuery,
                    fuzziness: "AUTO",
                    max_expansions: 50,
                    prefix_length: 1,
                    boost: 8.0,
                  },
                },
              },
              {
                match: {
                  "name.phonetic": {
                    query: cleanQuery,
                    boost: 6.0,
                  },
                },
              },
              {
                prefix: {
                  "name.keyword": {
                    value: cleanQuery.toLowerCase(),
                    boost: 7.0,
                  },
                },
              },
              {
                wildcard: {
                  "name.keyword": `*${cleanQuery.toLowerCase()}*`,
                },
              },
              {
                match: {
                  "name.abbreviation": {
                    query: cleanQuery,
                    boost: 5.0,
                  },
                },
              },
              {
                multi_match: {
                  query: cleanQuery,
                  fields: ["name^3", "normalizedName^2"],
                  type: "cross_fields",
                  operator: "and",
                  boost: 3.0,
                },
              },
              // {
              //   query_string: {
              //     query: `*${cleanQuery}*`,
              //     fields: ["name"],
              //     default_operator: "OR",
              //   },
              // },
            ],
            minimum_should_match: 1,
          },
        },
        size: limit,
      };
      const response = await esClient.search<IArtist>(searchRequest);
      const total =
        typeof response.hits.total === "number"
          ? response.hits.total
          : response.hits.total?.value ?? 0;
      return {
        artists: response.hits.hits.map((hit) => ({
          ...(hit._source || {}),
          _id: hit._id,
          _score: hit._score,
          highlight: hit.highlight,
        })) as ArtistHit[],
        total,
        took: response.took,
        aggregations: response.aggregations ?? {},
      };
    } catch (error) {
      logger.error("Elasticsearch search error:", error);
      logger.error("Search query:", query);
      throw error;
    }
  }

  async suggest(query: string, limit: number = 10): Promise<IArtist[]> {
    if (!query || query.length < 1) return [];
    try {
      const response = await esClient.search({
        index: this.indexName,
        suggest: {
          artist_suggest: {
            prefix: query.toLowerCase(),
            completion: {
              field: "suggest",
              size: limit * 2,
              fuzzy: {
                fuzziness: 2,
                min_length: 1,
                prefix_length: 0,
                transpositions: true,
                unicode_aware: false,
              },
              skip_duplicates: true,
            },
          },
        },
        _source: ["name", "genres", "profilePicture", "spotifyUrl"],
      });
      const suggestOptions = response.suggest?.artist_suggest?.[0]?.options;
      const suggestions = Array.isArray(suggestOptions) ? suggestOptions : [];
      return suggestions.map((option: any) => ({
        ...option._source,
        _id: option._id,
        _score: option._score,
      }));
    } catch (error) {
      logger.error("Elasticsearch suggestion error:", error);
      return [];
    }
  }

  async getIndexStats(): Promise<IndicesStatsResponse> {
    try {
      const stats = await esClient.indices.stats({ index: this.indexName });
      return stats;
    } catch (error) {
      logger.error("Error getting index stats:", error);
      throw error;
    }
  }

  private generateSuggestions(name: string): string[] {
    if (!name) return [];

    const suggestions: Set<string> = new Set();
    const cleanName = name.toLowerCase().trim();

    suggestions.add(name);
    suggestions.add(cleanName);

    const variations = [
      ...this.generateTypoVariations(name),
      ...this.generatePhoneticVariations(name),
      ...this.generateAbbreviations(name),
      ...this.generatePartialMatches(name),
      ...this.generateSpacingVariations(name),
    ];

    variations.forEach((variation) => {
      if (variation.length >= 2 && variation.length <= 50) {
        suggestions.add(variation);
      }
    });

    return Array.from(suggestions);
  }

  private generateTypoVariations(name: string): string[] {
    const variations: string[] = [];
    const cleanName = name.toLowerCase();

    const substitutions = [
      ["ph", "f"],
      ["f", "ph"],
      ["ck", "k"],
      ["k", "ck"],
      ["z", "s"],
      ["s", "z"],
      ["y", "i"],
      ["i", "y"],
      ["c", "k"],
      ["k", "c"],
      ["ei", "ie"],
      ["ie", "ei"],
      ["ou", "ow"],
      ["ow", "ou"],
    ];

    substitutions.forEach(([from, to]) => {
      const variation = cleanName.replace(new RegExp(from, "g"), to);
      if (variation !== cleanName) {
        variations.push(variation);
      }
    });

    return variations;
  }

  private generatePhoneticVariations(name: string): string[] {
    const variations: string[] = [];

    const phoneticRules: [RegExp, string][] = [
      [/ph/g, "f"],
      [/f/g, "ph"],
      [/ck/g, "k"],
      [/k/g, "ck"],
      [/z/g, "s"],
      [/s/g, "z"],
      [/y/g, "i"],
      [/ie/g, "ei"],
      [/ou/g, "ow"],
      [/ow/g, "ou"],
    ];

    phoneticRules.forEach(([pattern, replacement]) => {
      const variation = name.toLowerCase().replace(pattern, replacement);
      if (variation !== name.toLowerCase()) {
        variations.push(variation);
      }
    });

    return variations;
  }

  private generateAbbreviations(name: string): string[] {
    const variations: string[] = [];
    const words = name
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    if (words.length >= 2) {
      const initials = words.map((word) => word[0]).join("");
      variations.push(initials);

      const spacedInitials = words.map((word) => word[0]).join(" ");
      variations.push(spacedInitials);

      const abbreviationMap: Record<string, string[]> = {
        mj: ["michael jackson"],
        jt: ["justin timberlake"],
        jlo: ["jennifer lopez"],
        eminem: ["em", "slim shady"],
        rihanna: ["riri"],
        beyonce: ["bee", "queen b"],
      };

      Object.entries(abbreviationMap).forEach(([abbrev, fullNames]) => {
        if (
          fullNames.some((fullName) => name.toLowerCase().includes(fullName))
        ) {
          variations.push(abbrev);
        }
      });
    }

    return variations;
  }

  private generatePartialMatches(name: string): string[] {
    const variations: string[] = [];
    const words = name.toLowerCase().split(/\s+/);

    words.forEach((word, index) => {
      if (word.length >= 3) {
        for (let i = 3; i <= word.length - 1; i++) {
          variations.push(word.substring(0, i));
        }

        const suffixes = ["er", "ed", "ing", "s"];
        suffixes.forEach((suffix) => {
          if (word.endsWith(suffix) && word.length > suffix.length + 2) {
            variations.push(word.slice(0, -suffix.length));
          }
        });
      }
    });

    return variations;
  }

  private generateSpacingVariations(name: string): string[] {
    const variations: string[] = [];

    variations.push(name.replace(/\s+/g, ""));

    const spacedVersion = name.replace(/([a-z])([A-Z])/g, "$1 $2");
    if (spacedVersion !== name) {
      variations.push(spacedVersion.toLowerCase());
    }

    return variations;
  }
}
