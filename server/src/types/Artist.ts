import { Types } from "mongoose";

export interface IArtist {
  _id: Types.ObjectId;
  name: string;
  genres: string[];
  profilePicture: string;
  spotifyUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArtistDTO {
  name: string;
  genres: string[];
  profilePicture?: string;
  spotifyUrl: string;
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