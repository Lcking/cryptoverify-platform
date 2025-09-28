import React, { useState } from 'react';
import { TAGLINE_LINE1, TAGLINE_LINE2, HERO_SUBTEXT } from '../../config/brand';

const HeroBanner = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const hotSearches = [
    'Binance',
    'Coinbase',
    'Kraken',
    'Huobi',
    'KuCoin'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = (searchQuery || '').trim();
    if (q.length === 0) return;
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const handleHotSearch = (platform) => {
    setSearchQuery(platform);
  };

  // Submit CTA removed (Navbar contains the primary entry)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-gradient"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {TAGLINE_LINE1}
          <span className="block text-blue-200">{TAGLINE_LINE2}</span>
        </h1>
        
        <p className="text-lg sm:text-xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
          {HERO_SUBTEXT}
        </p>

  {/* Search form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400 text-lg"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a platform..."
              className="w-full pl-14 pr-32 py-4 bg-white rounded-full text-gray-900 placeholder-gray-500 text-lg shadow-xl border-0 focus:ring-4 focus:ring-blue-300/50 focus:outline-none transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Submit CTA moved to Navbar */}

        {/* Hot searches */}
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-sm mb-4 font-medium">Popular Searches:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {hotSearches.map((platform) => (
              <button
                key={platform}
                onClick={() => handleHotSearch(platform)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-blue-200 text-sm">Verified Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-blue-200 text-sm">Monitoring Service</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">99.9%</div>
            <div className="text-blue-200 text-sm">Accuracy Rate</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <i className="fas fa-chevron-down text-white text-xl opacity-75"></i>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;