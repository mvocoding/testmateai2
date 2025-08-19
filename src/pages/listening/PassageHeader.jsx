import React from 'react';

const PassageHeader = ({ title, heading }) => {
  return (
    <div className="mb-4 text-center">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-teal-700 mb-2">
          {heading || 'Listening Practice'}
        </h2>
      </div>
      <div className="text-xl font-semibold text-gray-800 text-center bg-teal-50 border border-teal-200 rounded-xl p-2">
        {title}
      </div>
    </div>
  );
};

export default PassageHeader;


