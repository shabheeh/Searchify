import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-12">
      <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
        Searchify
      </h1>
      <p className="text-white/70 text-lg md:text-xl mt-4 font-light">
        Discover your next favorite artist
      </p>
    </header>
  );
};

export default Header;
