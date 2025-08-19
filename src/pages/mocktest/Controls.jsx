import React from 'react';

const Controls = ({
  onPrev,
  onNext,
  onSubmit,
  canPrev,
  canNext,
  canSubmit,
}) => {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {canSubmit ? (
        <button
          onClick={onSubmit}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold"
        >
          Submit Test
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canNext}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Controls;


