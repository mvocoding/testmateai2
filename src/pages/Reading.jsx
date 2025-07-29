import React, { useState } from 'react';

const PASSAGE = `The honeybee is a remarkable insect known for its role in pollination and for producing honey and beeswax. Honeybees live in well-organized colonies and communicate with each other through a unique dance language. Their work is essential for the growth of many crops and wild plants.`;

const QUESTION = {
  text: 'What is one important role of the honeybee?',
  options: [
    'They make silk for clothing.',
    'They pollinate plants and crops.',
    'They eat harmful insects.',
    'They live alone in the wild.',
  ],
  correct: 1,
};

const Reading = () => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full  bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 mb-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-teal-700 mb-4 drop-shadow-lg">
            Reading Challenge
          </h1>
        </div>
        <div className="text-gray-800 text-lg leading-relaxed mb-4 whitespace-pre-line">
          {PASSAGE}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="font-semibold text-gray-700 mb-2">
            {QUESTION.text}
          </div>
          <div className="flex flex-col gap-3">
            {QUESTION.options.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  selected === idx
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="reading-question"
                  value={idx}
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                  className="accent-primary-600 w-5 h-5"
                  required
                />
                <span className="text-gray-800 text-base">{option}</span>
              </label>
            ))}
          </div>
          {!submitted ? (
            <button
              type="submit"
              className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
              disabled={selected === null}
            >
              Submit
            </button>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              {selected === QUESTION.correct ? (
                <div className="text-green-700 font-bold text-lg">
                  Correct! 🎉
                </div>
              ) : (
                <div className="text-red-600 font-bold text-lg">
                  Incorrect. The correct answer is:{' '}
                  <span className="underline">
                    {QUESTION.options[QUESTION.correct]}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleTryAgain}
                className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
              >
                Try Another
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Reading;
