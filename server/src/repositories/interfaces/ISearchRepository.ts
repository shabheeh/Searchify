import { IArtist, SearchResponse } from "@/types/Artist";
import { IndicesStatsResponse } from "@elastic/elasticsearch/lib/api/types";

export interface ISearchRepository {
  createIndex(): Promise<void>;
  indexArtist(artist: IArtist): Promise<void>;
  bulkIndexArtists(artists: IArtist[]): Promise<void>;
  search(query: string): Promise<SearchResponse>;
  suggest(query: string, limit?: number): Promise<IArtist[]>;
  getIndexStats(): Promise<IndicesStatsResponse>;
}
