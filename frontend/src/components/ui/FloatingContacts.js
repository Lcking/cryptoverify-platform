import React, { useState } from 'react';

const FloatingContacts = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contactMethods = [
    {
      name: 'Telegram',
      icon: 'fab fa-telegram-plane',
      url: 'https://t.me/cryptoverify',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      url: 'https://wa.me/1234567890',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'Discord',
      icon: 'fab fa-discord',
      url: 'https://discord.gg/cryptoverify',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    }
  ];

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="flex flex-col items-center space-y-3">
        {/* Contact method buttons - shown when expanded */}
        {isExpanded && (
          <div className="flex flex-col space-y-3 animate-fade-in">
            {contactMethods.map((method, index) => (
              <a
                key={method.name}
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 ${method.bgColor} ${method.hoverColor} text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                title={`Contact us on ${method.name}`}
              >
                <i className={`${method.icon} text-lg group-hover:scale-110 transition-transform duration-200`}></i>
              </a>
            ))}
          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          title={isExpanded ? 'Close contacts' : 'Contact us'}
        >
          <i className={`fas ${isExpanded ? 'fa-times' : 'fa-comments'} text-lg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
        </button>
      </div>

      {/* Pulse animation for main button when collapsed */}
      {!isExpanded && (
        <div className="absolute inset-0 w-14 h-14 bg-blue-600 rounded-full animate-ping opacity-20"></div>
      )}
    </div>
  );
};

// Add CSS animation for fade-in effect
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default FloatingContacts;