import React, { useState } from 'react';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { ENABLE_CMS, CMS_BASE_URL, CMS_SUBMISSIONS_API, CMS_API_TOKEN } from '../../config/cms';
import { SUBMIT_MODE, GOOGLE_FORM_URL, FALLBACK_MAILTO, getGoogleFormEmbedUrl } from '../../config/submit';

const initialState = {
  type: 'platform', // platform | exposure
  name: '',
  website: '',
  summary: '',
  evidence: '', // links
  contact: ''
};

async function submitToCMS(data) {
  if (!ENABLE_CMS || !CMS_BASE_URL) return { ok: false, error: 'CMS disabled' };
  try {
    const res = await fetch(`${CMS_BASE_URL}${CMS_SUBMISSIONS_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {})
      },
      body: JSON.stringify({ data })
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `CMS error ${res.status}: ${t}` };
    }
    const json = await res.json();
    return { ok: true, json };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const SubmitPage = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const mailtoFallback = () => {
    const body = encodeURIComponent(
      `Type: ${form.type}\nName: ${form.name}\nWebsite: ${form.website}\nSummary: ${form.summary}\nEvidence: ${form.evidence}\nContact: ${form.contact}\n`
    );
    const subject = encodeURIComponent('Submit Platform/Exposure');
    window.location.href = `mailto:${FALLBACK_MAILTO}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    // 1) 尝试直连 CMS
    if (ENABLE_CMS && CMS_BASE_URL) {
      const { ok, error } = await submitToCMS(form);
      setLoading(false);
      if (ok) {
        setResult({ type: 'success', message: 'Submitted to CMS successfully. Thank you!' });
        setForm(initialState);
        return;
      }
      setResult({ type: 'error', message: error || 'Failed to submit to CMS.' });
      return;
    }

    // 2) 如果配置了 Google 表单，转向该表单
    if (SUBMIT_MODE === 'google' && GOOGLE_FORM_URL) {
      const url = getGoogleFormEmbedUrl() || GOOGLE_FORM_URL;
      window.open(url, '_blank', 'noopener');
      setLoading(false);
      return;
    }

    // 3) 回退 mailto
    mailtoFallback();
    setLoading(false);
  };

  const title = 'Submit a Platform or Exposure Report';
  const description = 'Share a platform to verify or report a suspicious/fraudulent platform. Your submission helps the community.';

  return (
    <PageLayout title={title} description={description}>
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Submit', to: '/submit' }
            ]}
          />
          <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={form.type} onChange={onChange} className="w-full border rounded-lg px-3 py-2">
                <option value="platform">Real Platform</option>
                <option value="exposure">Exposure Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input name="name" value={form.name} onChange={onChange} required placeholder="e.g., Example Exchange" className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Website</label>
              <input name="website" value={form.website} onChange={onChange} placeholder="https://..." className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea name="summary" value={form.summary} onChange={onChange} rows={4} placeholder="Brief description or reason of exposure..." className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Links (optional)</label>
              <textarea name="evidence" value={form.evidence} onChange={onChange} rows={3} placeholder="One per line (URLs)" className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Contact (optional)</label>
              <input name="contact" value={form.contact} onChange={onChange} placeholder="Email/Telegram/etc." className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-medium">
                {loading ? 'Submitting…' : 'Submit'}
              </button>
              {!ENABLE_CMS && (
                <div className="text-xs text-gray-500">CMS not configured — will open Google Form or email.</div>
              )}
            </div>

            {result && (
              <div className={`text-sm ${result.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </div>
            )}
          </form>
        </div>
      </section>
    </PageLayout>
  );
};

export default SubmitPage;
