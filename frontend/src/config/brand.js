// Centralized brand configuration (proxy to siteContent)
import siteContent from './siteContent';

export const SITE_NAME = siteContent.brand?.siteName || 'CryptoVerify';
export const LOGO_SRC = siteContent.brand?.logo?.src || '';
export const LOGO_ALT = siteContent.brand?.logo?.alt || 'Site Logo';

// Hero texts
export const TAGLINE_LINE1 = siteContent.hero?.line1 || 'Verify Platforms';
export const TAGLINE_LINE2 = siteContent.hero?.line2 || 'With Confidence';
export const HERO_SUBTEXT = siteContent.hero?.subtext || 'Professional verification service for online platforms.';
