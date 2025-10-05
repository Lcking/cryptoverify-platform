import React from 'react';
import siteContent from '../../config/siteContent';

const ValuesSection = () => {
  const values = [
    {
      icon: 'fas fa-shield-halved',
      title: 'Security First',
      description:
        'We prioritize the safety and security of users through rigorous platform verification processes for the gamble ecosystem.',
    },
    {
      icon: 'fas fa-eye',
      title: 'Transparency',
      description: 'Complete transparency in our verification methods and criteria for platform evaluation.',
    },
    {
      icon: 'fas fa-users',
      title: 'Community Driven',
      description: 'Powered by the community, for the community. Your security is our mission.',
    },
    {
      icon: 'fas fa-clock',
      title: '24/7 Monitoring',
      description: 'Continuous monitoring and real-time updates to ensure platform integrity around the clock.',
    },
  ];

  const partners = siteContent?.partners?.items || [];

  const stats = [
    {
      number: '$2.5B+',
      label: 'Assets Protected',
      icon: 'fas fa-shield',
    },
    {
      number: '500K+',
      label: 'Users Protected',
      icon: 'fas fa-users',
    },
    {
      number: '50+',
      label: 'Countries Served',
      icon: 'fas fa-globe',
    },
    {
      number: '99.9%',
      label: 'Uptime',
      icon: 'fas fa-clock',
    },
  ];

  return (
    <section className="py-20 bg-gray-50" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built on principles of security, transparency, and community trust, we're committed to protecting the gamble platforms ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <i className={`${value.icon} text-2xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Trusted by the Community</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our impact in numbers - protecting traders and investors worldwide through comprehensive platform verification services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                  <i className={`${stat.icon} text-2xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Partners & Collaborators</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Working alongside industry leaders to ensure comprehensive coverage and the highest standards of platform verification.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-1"
              >
                <div className="mb-4">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{partner.name}</h4>
                <p className="text-xs text-gray-500 mb-1">{partner.type}</p>
                {partner.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{partner.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Join Our Mission</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Help us build a safer gamble platforms ecosystem. Report suspicious platforms, share your experiences, and protect the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={siteContent?.cta?.reportPlatform?.to || '#'}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {siteContent?.cta?.reportPlatform?.label || 'Report Platform'}
              </a>
              <a
                href={siteContent?.cta?.becomePartner?.to || '#'}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-all duration-300"
              >
                {siteContent?.cta?.becomePartner?.label || 'Become Partner'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;