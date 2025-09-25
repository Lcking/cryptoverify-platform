import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fas fa-list-check',
      title: 'Platform Directory',
      description: 'Comprehensive database of verified cryptocurrency trading platforms with detailed information and ratings.',
      link: '#platforms',
      color: 'blue'
    },
    {
      icon: 'fas fa-shield-check',
      title: 'Real-time Verification',
      description: 'Advanced verification system that continuously monitors platform authenticity and security status.',
      link: '#verification',
      color: 'green'
    },
    {
      icon: 'fas fa-exclamation-triangle',
      title: 'Fraud Exposure',
      description: 'Immediate alerts and exposure of fraudulent platforms to protect the cryptocurrency community.',
      link: '#exposure',
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colors[color];
  };

  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Core Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive cryptocurrency platform verification and monitoring services 
            designed to protect traders and investors from fraud.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color);
            
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8"
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${feature.icon} ${colorClasses.icon} text-2xl`}></i>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* CTA Button */}
                <a
                  href={feature.link}
                  className={`inline-flex items-center px-6 py-3 ${colorClasses.button} text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                >
                  Learn More
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                </a>
              </div>
            );
          })}
        </div>

        {/* Additional info cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600 text-sm">Verified Platforms</div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Real-time Monitoring</div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl font-bold text-red-600 mb-2">150+</div>
            <div className="text-gray-600 text-sm">Fraud Cases Exposed</div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600 text-sm">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;