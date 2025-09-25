import React from 'react';

const Footer = () => {
  const footerLinks = {
    'Platform': [
      { name: 'Directory', href: '#platforms' },
      { name: 'Verification Process', href: '#verification' },
      { name: 'Security Standards', href: '#security' },
      { name: 'API Access', href: '#api' }
    ],
    'Resources': [
      { name: 'Blog', href: '#blog' },
      { name: 'Research', href: '#research' },
      { name: 'Documentation', href: '#docs' },
      { name: 'Help Center', href: '#help' }
    ],
    'Company': [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Contact', href: '#contact' }
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Disclaimer', href: '#disclaimer' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'fab fa-twitter', href: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', href: '#', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: 'fab fa-github', href: '#', color: 'hover:text-gray-600' },
    { name: 'Discord', icon: 'fab fa-discord', href: '#', color: 'hover:text-indigo-500' },
    { name: 'Telegram', icon: 'fab fa-telegram', href: '#', color: 'hover:text-blue-500' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-8 lg:mb-0 lg:mr-8">
              <h3 className="text-2xl font-bold mb-2">Stay Informed</h3>
              <p className="text-gray-400 max-w-md">
                Get the latest updates on platform verifications, security alerts, 
                and market insights delivered to your inbox.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-4 max-w-md lg:max-w-lg">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-check text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">CryptoVerify</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Professional cryptocurrency platform verification service. 
              Protecting traders and investors through comprehensive 
              security assessments and real-time monitoring.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-6">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 CryptoVerify. All rights reserved. Built with security in mind.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <i className="fas fa-shield-check text-green-500 mr-2"></i>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock text-blue-500 mr-2"></i>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-globe text-purple-500 mr-2"></i>
                <span>50+ Countries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;