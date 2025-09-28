// Submission configuration for "Submit Platform" CTA
// Minimal viable path: use a Google Form. Optionally provide a fallback mailto.

export const SUBMIT_MODE = 'google'; // 'google' | 'mailto'

// Put your Google Form link here (edit to your real form)
// Example: https://docs.google.com/forms/d/e/<form_id>/viewform
export const GOOGLE_FORM_URL = '';

// Fallback email if Google Form is not provided
export const FALLBACK_MAILTO = 'owner@example.com';

export function getGoogleFormEmbedUrl() {
  if (!GOOGLE_FORM_URL) return '';
  try {
    const url = new URL(GOOGLE_FORM_URL);
    if (url.hostname.includes('docs.google.com')) {
      // Ensure embedded=true for iframe
      if (!url.searchParams.has('embedded')) url.searchParams.set('embedded', 'true');
      return url.toString();
    }
  } catch (_) {
    // ignore malformed URL
  }
  return GOOGLE_FORM_URL;
}
