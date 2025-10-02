// Centralized non-CMS site content configuration
// Purpose: Manage brand, static texts, links, images, contacts that should NOT come from CMS
// Scope: Navbar labels, Hero texts, Footer links, Social/Contact links, Logos, default stats, etc.
// Note: Content pages (News/Insights/Exposure/Verifications/Platforms data) remain in CMS.

const siteContent = {
  brand: {
    siteName: 'GambleVerify',
    logo: {
      src: '', // e.g. '/logo.svg'. Put file in public/ and set the path.
      alt: 'GambleVerify Logo'
    }
  },

  // Navbar & navigation
  navigation: {
    primary: [
      { label: 'Home', to: '/' },
      { label: 'News', to: '/news' },
      { label: 'Platforms', to: '/platforms' },
      { label: 'Verifications', to: '/verifications' },
      { label: 'Insights', to: '/insights' },
      { label: 'Exposure', to: '/exposure' }
    ],
    cta: {
      label: 'Submit Platform',
      to: '/submit'
    }
  },

  // Hero section static texts (not from CMS)
  hero: {
    line1: 'Verify Gamble Platforms',
    line2: 'With Confidence',
    subtext:
      'Professional verification service for gamble platforms. Get real-time authenticity checks, security reviews, and fraud alerts.',
    hotSearches: ['bet365', 'pinnacle', '1xbet', 'betway', 'unibet'],
    stats: [
      { value: '500+', label: 'Verified Entries' },
      { value: '24/7', label: 'Monitoring Service' },
      { value: '99.9%', label: 'Accuracy Rate' }
    ]
  },

  // Footer links and social profiles
  footer: {
    columns: {
      Platform: [
        { name: 'Directory', href: '#platforms' },
        { name: 'Verification Process', href: '#verification' },
        { name: 'Security Standards', href: '#security' },
        { name: 'API Access', href: '#api' }
      ],
      Resources: [
        { name: 'Blog', href: '#blog' },
        { name: 'Research', href: '#research' },
        { name: 'Documentation', href: '#docs' },
        { name: 'Help Center', href: '#help' }
      ],
      Company: [
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Press', href: '#press' },
        { name: 'Contact', href: '#contact' }
      ],
      Legal: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'Disclaimer', href: '#disclaimer' }
      ]
    },
    social: [
      { name: 'Twitter', icon: 'fab fa-twitter', href: '#' , color: 'hover:text-blue-400' },
      { name: 'LinkedIn', icon: 'fab fa-linkedin', href: '#', color: 'hover:text-blue-600' },
      { name: 'GitHub', icon: 'fab fa-github', href: '#', color: 'hover:text-gray-600' },
      { name: 'Discord', icon: 'fab fa-discord', href: '#', color: 'hover:text-indigo-500' },
      { name: 'Telegram', icon: 'fab fa-telegram', href: '#', color: 'hover:text-blue-500' }
    ],
    copyright:
      '© 2024 GambleVerify. All rights reserved. Built with security in mind.',
    badges: [
      { icon: 'fas fa-shield-check text-green-500', label: 'SSL Secured' },
      { icon: 'fas fa-clock text-blue-500', label: '99.9% Uptime' },
      { icon: 'fas fa-globe text-purple-500', label: '50+ Countries' }
    ]
  },

  // Partners & collaborators (managed here, not from CMS)
  partners: {
    items: [
      {
        name: 'CoinDesk',
        type: 'Media Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=CoinDesk',
        description: 'Leading digital asset media covering markets and policy.',
        url: '#'
      },
      {
        name: 'CoinTelegraph',
        type: 'News Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=Cointelegraph',
        description: 'Crypto and blockchain news with global reach.',
        url: '#'
      },
      {
        name: 'Blockchain.com',
        type: 'Technology Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=Blockchain',
        description: 'Wallet and infrastructure provider in the crypto space.',
        url: '#'
      },
      {
        name: 'CryptoCompare',
        type: 'Data Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=CryptoCompare',
        description: 'Market data and indices for digital assets.',
        url: '#'
      },
      {
        name: 'ConsenSys',
        type: 'Security Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=ConsenSys',
        description: 'Ethereum software company advancing Web3.',
        url: '#'
      },
      {
        name: 'Chainalysis',
        type: 'Analytics Partner',
        logo: 'https://via.placeholder.com/120x60/e5e7eb/6b7280?text=Chainalysis',
        description: 'Blockchain analysis solutions for compliance and investigations.',
        url: '#'
      }
    ]
  },

  // Home CTA configuration (Join Our Mission)
  cta: {
    reportPlatform: {
      label: 'Report Platform',
      to: '/submit'
    },
    becomePartner: {
      label: 'Become Partner',
      to: '#contact'
    }
  },

  // Static page titles/descriptions (non-CMS)
  pages: {
    home: {
      title: 'GambleVerify - Platform Verification & Risk Alerts',
      description: 'Professional verification service for gamble platforms with real-time checks, security reviews, and fraud alerts.',
      seo: {
        title: 'GambleVerify - Platform Verification & Risk Alerts',
        description: 'Professional verification service for gamble platforms with real-time checks, security reviews, and fraud alerts.',
        keywords: 'gamble verification, platform review, fraud alerts, security checks, monitoring'
      }
    },
    news: {
      title: '24/7 Live Gamble   News',
      description: 'Real-time market intelligence and concise gamble asset developments.',
      seo: {
        title: 'Live Gamble News - 24/7 Updates',
        description: 'Real-time market intelligence and concise gamble asset developments.',
        keywords: 'gamble news, market updates, crypto news, live news'
      }
    },
    platforms: {
      title: 'Gamble Platforms',
      description: 'Directory of major exchanges ranked by composite trust and operational metrics.',
      seo: {
        title: 'Gamble Platforms Directory',
        description: 'Directory of major exchanges ranked by composite trust and operational metrics.',
        keywords: 'platform directory, exchange list, platform ranking, trust score'
      }
    },
    verifications: {
      title: 'Verifications',
      description: 'Published verification records by editors with operation evidence and checks.',
      seo: {
        title: 'Platform Verifications',
        description: 'Published verification records by editors with operation evidence and checks.',
        keywords: 'platform verification, audit, checks, compliance'
      }
    },
    insights: {
      title: 'Market Insights & Research',
      description: 'Analytical perspectives, structural metrics, and forward-looking market intelligence.',
      seo: {
        title: 'Gamble Market Insights & Research',
        description: 'Analytical perspectives, structural metrics, and forward-looking market intelligence.',
        keywords: 'market insights, research, analysis, reports'
      }
    },
    exposure: {
      title: 'Fraud Exposure & Risk Alerts',
      description: 'Verified community and analytic reports exposing fraudulent or high-risk online platforms with evidence.',
      seo: {
        title: 'Fraud Exposure & Risk Alerts',
        description: 'Verified community and analytic reports exposing fraudulent or high-risk online platforms with evidence.',
        keywords: 'fraud exposure, risk alerts, scam report, platform risk'
      }
    },
    submit: {
      title: 'Submit a Platform or Exposure Report',
      description: 'Share a platform to verify or report a suspicious/fraudulent platform. Your submission helps the community.',
      seo: {
        title: 'Submit Platform or Exposure Report',
        description: 'Share a platform to verify or report a suspicious/fraudulent platform. Your submission helps the community.',
        keywords: 'submit platform, report exposure, contact, contribute'
      }
    },
    search: {
      title: 'Search Results',
      description: 'Type a keyword to search across the site.',
      seo: {
        title: 'Search',
        description: 'Type a keyword to search across the site.',
        keywords: 'search, find platform, query'
      }
    }
  },

  // Floating contact buttons
  contacts: [
    {
      name: 'Telegram',
      icon: 'fab fa-telegram-plane',
      url: 'https://t.me/gambleverify',
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
      url: 'https://discord.gg/gambleverify',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    }
  ]
};

export default siteContent;

