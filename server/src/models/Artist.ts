import { IArtist } from "@/types/Artist";
import { Document, model, Schema } from "mongoose";

export type ArtistDocument = Document & IArtist;

const ArtistSchema = new Schema<ArtistDocument>(
  {
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    genres: [
      {
        type: String,
        index: true,
        trim: true,
        lowercase: true,
      },
    ],
    profilePicture: {
      type: String,
      default: null,
    },
    spotifyUrl: {
        type: String,
        required: false,
    }
  },
  {
    timestamps: true,
  }
);

export const ArtistModel = model<ArtistDocument>("Artist", ArtistSchema);
