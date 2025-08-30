import { Types } from "mongoose";

export interface IArtist {
  _id: Types.ObjectId;
  name: string;
  normalizedName: string;
  genres: string[];
  profilePicture: string;
  spotifyUrl: string;
  spotifyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArtistDTO {
  name: string;
  normalizedName: string;
  genres: string[];
  profilePicture?: string;
  spotifyUrl: string;
  spotifyId: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height: number; width: number }>;
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface ArtistHit {
  _id: string;
  _score?: number | null;
  highlight?: Record<string, string[]>;
  name?: string;
  normalizedName?: string;
  genres?: string[];
  profilePicture?: string;
  spotifyUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchResponse {
  artists: ArtistHit[];
  total: number;
  took: number;
  aggregations?: Record<string, any>;
}
