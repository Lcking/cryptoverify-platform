import React from 'react';

const VerifiedBadge = ({ verified, count = 0, onClick }) => {
  if (verified) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      >
        <i className="fas fa-badge-check mr-2 text-white"></i>
        Verified {typeof count === 'number' ? `(${count})` : ''}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
      <i className="far fa-clock mr-1"></i>
      Pending Verification
    </span>
  );
};

export default VerifiedBadge;
