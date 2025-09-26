import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', to: '/' },
    { name: 'News', to: '/news' },
    { name: 'Platforms', to: '/platforms' },
    { name: 'Insights', to: '/insights' },
    { name: 'Exposure', to: '/exposure' }
  ];

  const linkBase = (scrolled) => scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-check text-white text-sm"></i>
            </div>
            <Link
              to="/"
              className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            >
              CryptoVerify
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.to}
                className={`${linkBase(isScrolled)} text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.to ? 'text-blue-600' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
              Submit Platform
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.to
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 mt-2">
                Submit Platform
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;