import React from 'react';

// Simple SEO component to inject title, description, and keywords
// Usage: <Seo title="..." description="..." keywords="a, b, c" />
const Seo = ({ title, description, keywords }) => {
  React.useEffect(() => {
    if (title) {
      document.title = title;
      const ogTitle = ensureMeta('meta[property="og:title"]');
      ogTitle.setAttribute('content', title);
      const twitterTitle = ensureMeta('meta[property="twitter:title"]');
      twitterTitle.setAttribute('content', title);
    }
    if (description) {
      ensureNamedMeta('description').setAttribute('content', description);
      const ogDesc = ensureMeta('meta[property="og:description"]');
      ogDesc.setAttribute('content', description);
      const twitterDesc = ensureMeta('meta[property="twitter:description"]');
      twitterDesc.setAttribute('content', description);
    }
    if (keywords) {
      ensureNamedMeta('keywords').setAttribute('content', keywords);
    }
  }, [title, description, keywords]);

  return null;
};

function ensureMeta(selector) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const match = selector.match(/\[([^=]+)="([^"]+)"\]/);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  return el;
}

function ensureNamedMeta(name) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  return el;
}

export default Seo;
