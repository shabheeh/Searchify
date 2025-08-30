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
    normalizedName: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
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
    },
    spotifyId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
  },
  {
    timestamps: true,
  }
);

ArtistSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.normalizedName = this.name.toLowerCase().trim();
  }
  next();
});

export const ArtistModel = model<ArtistDocument>("Artist", ArtistSchema);
