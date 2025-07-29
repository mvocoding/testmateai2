import React, { useState } from 'react';

const WRITING_PARTS = {
  task1: {
    name: 'Task 1: Academic/General',
    description: 'Describe visual information (charts, graphs, processes)',
    prompts: [
      'The chart below shows the percentage of households in different income brackets in three countries. Summarize the information by selecting and reporting the main features.',
      'The diagram illustrates the process of how coffee is produced. Summarize the information by selecting and reporting the main features.',
      'The graph shows the average monthly temperatures in four cities. Summarize the information by selecting and reporting the main features.',
      'The table shows the number of students enrolled in different courses at a university. Summarize the information by selecting and reporting the main features.',
      'The map shows the development of a town over a 50-year period. Summarize the information by selecting and reporting the main features.',
    ],
  },
  task2: {
    name: 'Task 2: Essay',
    description: 'Write an essay on a given topic',
    prompts: [
      'Some people believe that technology has made life easier and more convenient, while others think it has made life more complex and stressful. Discuss both views and give your opinion.',
      'Many people believe that the best way to learn a foreign language is to live in the country where it is spoken. To what extent do you agree or disagree?',
      'Some people think that the government should spend money on public services rather than on the arts. To what extent do you agree or disagree?',
      'In many countries, people are living longer. What are the advantages and disadvantages of this trend?',
      'Some people believe that children should be taught to be competitive, while others think they should be taught to cooperate. Discuss both views and give your opinion.',
    ],
  },
};

const Writing = () => {
  const [selectedTask, setSelectedTask] = useState('task1');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentPrompts = WRITING_PARTS[selectedTask].prompts;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Writing Test
            </h1>
          </div>
          <div className="flex gap-3 justify-center">
            {Object.entries(WRITING_PARTS).map(([key, task]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTask(key);
                  setCurrentPrompt(0);
                  setAnswer('');
                  setSubmitted(false);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedTask === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{task.name.split(':')[0]}</div>
                  <div className="text-xs opacity-80">
                    {task.name.split(':')[1]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {currentPrompts[currentPrompt]}
            </div>
            <textarea
              className="w-full min-h-[300px] rounded-2xl border border-gray-200 bg-gray-50 p-5 text-lg shadow focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400 transition-all resize-y placeholder-gray-400"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              required
              style={{ resize: 'vertical' }}
            />
            <div className="flex gap-3 justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
              >
                Submit
              </button>
              {currentPrompt < currentPrompts.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPrompt(currentPrompt + 1);
                    setAnswer('');
                  }}
                  className="bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
                >
                  Next Prompt
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <div className="text-lg font-semibold text-green-700 mb-2">
              Thank you for submitting your answer!
            </div>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 whitespace-pre-line">
              {answer}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                className="mt-4 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
                onClick={() => {
                  setAnswer('');
                  setSubmitted(false);
                }}
              >
                Try Another
              </button>
              {currentPrompt < currentPrompts.length - 1 && (
                <button
                  className="mt-4 bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
                  onClick={() => {
                    setCurrentPrompt(currentPrompt + 1);
                    setAnswer('');
                    setSubmitted(false);
                  }}
                >
                  Next Prompt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writing;
