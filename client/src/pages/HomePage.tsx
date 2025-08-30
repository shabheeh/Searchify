import React, { useState } from "react";
import type { Artist } from "../types";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ArtistCard from "../components/ArtistCard";


const HomePage: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searchResults, setSearchResults] = useState<Artist[]>([]);

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setSearchResults([]);
  };

  const handleSearchResults = (artists: Artist[]) => {
    setSearchResults(artists);
    setSelectedArtist(null);
  };

  console.log(searchResults, "serch")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <Header />

        <div className="mb-12">
          <SearchBar
            onArtistSelect={handleArtistSelect}
            onSearchResults={handleSearchResults}
          />
        </div>

        {selectedArtist && (
          <div className="mb-8">
            <ArtistCard artist={selectedArtist} />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
