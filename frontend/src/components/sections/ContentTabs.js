import React, { useState } from 'react';

const ContentTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'news',
      label: '24/7 Live News',
      icon: 'fas fa-broadcast-tower',
      color: 'blue'
    },
    {
      id: 'verification',
      label: 'Platform Verification',
      icon: 'fas fa-shield-check',
      color: 'green'
    },
    {
      id: 'insights',
      label: 'Market Insights',
      icon: 'fas fa-chart-line',
      color: 'purple'
    },
    {
      id: 'exposure',
      label: 'Fraud Exposure',
      icon: 'fas fa-exclamation-triangle',
      color: 'red'
    }
  ];

  // Mock data for different tabs
  const newsItems = [
    {
      title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
      time: '2 minutes ago',
      source: 'CryptoDaily',
      type: 'Breaking'
    },
    {
      title: 'Major Exchange Announces Enhanced Security Features',
      time: '15 minutes ago',
      source: 'BlockNews',
      type: 'Update'
    },
    {
      title: 'Regulatory Clarity Expected in Q2 2024',
      time: '1 hour ago',
      source: 'Finance Watch',
      type: 'Analysis'
    }
  ];

  const verificationItems = [
    {
      platform: 'Binance',
      status: 'Verified',
      score: 9.8,
      lastCheck: '5 minutes ago',
      badges: ['Licensed', 'Insured', 'Audited']
    },
    {
      platform: 'Coinbase Pro',
      status: 'Verified',
      score: 9.5,
      lastCheck: '10 minutes ago',
      badges: ['Licensed', 'Public', 'Compliant']
    },
    {
      platform: 'Kraken',
      status: 'Verified',
      score: 9.3,
      lastCheck: '8 minutes ago',
      badges: ['Licensed', 'Secure', 'Transparent']
    }
  ];

  const insightItems = [
    {
      title: 'DeFi Market Analysis: Trends and Opportunities',
      category: 'Analysis',
      readTime: '5 min read',
      author: 'Expert Team'
    },
    {
      title: 'Top 10 Security Features Every Exchange Should Have',
      category: 'Guide',
      readTime: '8 min read',
      author: 'Security Analyst'
    },
    {
      title: 'Market Sentiment Report: Q1 2024',
      category: 'Report',
      readTime: '12 min read',
      author: 'Research Team'
    }
  ];

  const exposureItems = [
    {
      platform: 'FakeExchange Pro',
      type: 'Ponzi Scheme',
      reportedDate: '2 days ago',
      status: 'Under Investigation',
      severity: 'High'
    },
    {
      platform: 'ScamCoin Exchange',
      type: 'Exit Scam',
      reportedDate: '1 week ago',
      status: 'Confirmed Fraud',
      severity: 'Critical'
    },
    {
      platform: 'QuickTrade24',
      type: 'Fake License',
      reportedDate: '3 days ago',
      status: 'Warning Issued',
      severity: 'Medium'
    }
  ];

  const getTabContent = () => {
    switch (tabs[activeTab].id) {
      case 'news':
        return (
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.type === 'Breaking' ? 'bg-red-100 text-red-800' :
                    item.type === 'Update' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-gray-500 text-sm">{item.time}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  {item.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-newspaper mr-2"></i>
                  <span>{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'verification':
        return (
          <div className="space-y-4">
            {verificationItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.platform}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{item.score}</span>
                    <span className="text-sm text-gray-500">/10</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.badges.map((badge, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    {item.status}
                  </span>
                  <span>Last checked: {item.lastCheck}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'insights':
        return (
          <div className="space-y-4">
            {insightItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mr-3">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-500">{item.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  {item.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-user mr-2"></i>
                  <span>By {item.author}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'exposure':
        return (
          <div className="space-y-4">
            {exposureItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{item.platform}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    item.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-red-600 font-medium">{item.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{item.status}</span>
                  <span>Reported: {item.reportedDate}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-white" id="content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Real-time Information Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay informed with live updates, verification reports, market insights, 
            and fraud alerts from the online platforms ecosystem.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center mb-12 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center px-6 py-4 font-medium text-sm transition-all duration-300 border-b-2 ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="max-w-4xl mx-auto">
          {getTabContent()}
        </div>

        {/* View more button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
            View More {tabs[activeTab].label}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContentTabs;