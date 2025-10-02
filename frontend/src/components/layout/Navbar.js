import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_NAME, LOGO_SRC, LOGO_ALT } from '../../config/brand';
import siteContent from '../../config/siteContent';

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

  const navItems = (siteContent.navigation?.primary || []).map(i => ({ name: i.label, to: i.to }));

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
            {LOGO_SRC ? (
              <img src={LOGO_SRC} alt={LOGO_ALT} className="w-8 h-8 rounded-lg object-contain bg-white/0" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-check text-white text-sm"></i>
              </div>
            )}
            <Link
              to="/"
              className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            >
              {SITE_NAME}
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
            <Link
              to={siteContent.navigation?.cta?.to || '/submit'}
              className={`relative text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 ring-1 ring-blue-300/40 hover:shadow-lg hover:scale-105 ${
                location.pathname === (siteContent.navigation?.cta?.to || '/submit') ? 'ring-2 ring-offset-2 ring-offset-white' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {siteContent.navigation?.cta?.label || 'Submit Platform'}
            </Link>
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
              <Link
                to={siteContent.navigation?.cta?.to || '/submit'}
                className={`block text-center w-full text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 ring-1 ring-blue-300/40 ${
                  location.pathname === (siteContent.navigation?.cta?.to || '/submit') ? 'ring-2' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {siteContent.navigation?.cta?.label || 'Submit Platform'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;