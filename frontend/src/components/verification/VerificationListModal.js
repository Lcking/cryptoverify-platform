import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const VerificationListModal = ({ open, onClose, items = [], title = 'Verification Records', loading = false, hasMore = false, onLoadMore }) => {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true"></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="w-full max-w-xl bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900" aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No verification records yet.</div>
            ) : (
              <ul className="divide-y">
                {items.map(v => (
                  <li key={v.slug} className="p-4 flex items-center justify-between">
                    <div>
                      <Link to={`/verifications/${v.slug}`} className="text-blue-600 hover:underline font-medium">
                        {v.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(v.publishedAt).toLocaleString()}
                      </div>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400"></i>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {(loading || hasMore) && (
            <div className="p-4 border-t flex items-center justify-center">
              {loading ? (
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  <span>Loading…</span>
                </div>
              ) : (
                <button onClick={onLoadMore} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Load more</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationListModal;
