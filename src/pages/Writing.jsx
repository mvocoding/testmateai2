import React, { useState } from 'react';

const WRITING_PROMPT =
  'Describe a memorable event from your life. Explain why it was memorable and how it affected you.';

const Writing = () => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className=" bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full  bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-teal-700 mb-4 drop-shadow-lg">
            Writing Test
          </h1>
        </div>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {WRITING_PROMPT}
            </div>
            <textarea
              className="w-full min-h-[300px] rounded-2xl border border-gray-200 bg-gray-50 p-5 text-lg shadow focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all resize-y placeholder-gray-400"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              required
              style={{ resize: 'vertical' }}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              Submit
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <div className="text-lg font-semibold text-green-700 mb-2">
              Thank you for submitting your answer!
            </div>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 whitespace-pre-line">
              {answer}
            </div>
            <button
              className="mt-4 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
              onClick={() => {
                setAnswer('');
                setSubmitted(false);
              }}
            >
              Try Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writing;
