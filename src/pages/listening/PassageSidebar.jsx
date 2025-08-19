import React from 'react';

function PassageSidebar({ passages, currentIndex, onSelect }) {
  if (!Array.isArray(passages)) {
    return null;
  }

  return (
    <div className="w-full md:w-64 flex-shrink-0 mt-8 md:mt-0">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
        <div className="font-bold text-gray-700 mb-2 text-center">Questions</div>
        {passages.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => onSelect(idx)}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
              currentIndex === idx ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
            }`}
          >
            Passage {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PassageSidebar;


