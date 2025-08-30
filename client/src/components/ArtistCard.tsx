import React from "react";
import type { Artist } from "../types";

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <img
            src={artist.profilePicture || "/api/placeholder/200/200"}
            alt={artist.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          {artist.name}
        </h2>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {artist.genres.map((genre, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-medium"
            >
              {genre}
            </span>
          ))}
        </div>

        <a
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Listen on Spotify
        </a>
      </div>
    </div>
  );
};

export default ArtistCard;
