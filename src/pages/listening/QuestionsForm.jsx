import React from 'react';

function QuestionsForm({ questions, answers, onAnswerChange, onSubmit }) {
  if (!Array.isArray(questions)) {
    return null;
  }

  return (
    <form
      className="flex flex-col gap-6 mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h3 className="text-xl font-bold text-teal-700">Questions</h3>
      {questions.map((question, idx) => (
        <div key={question.id} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-3">
            {`Q${idx + 1}. ${question.question}`}
          </div>
          {question.options ? (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center gap-3 cursor-pointer group">
                  <span className="relative flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={(e) => onAnswerChange(question.id, parseInt(e.target.value))}
                      className="peer appearance-none w-6 h-6 rounded-full border-2 border-teal-400 bg-white checked:bg-gradient-to-br checked:from-teal-400 checked:to-emerald-400 checked:border-teal-600 transition-all duration-200 focus:ring-2 focus:ring-teal-300 shadow-sm"
                    />
                    <span className="absolute left-0 top-0 w-6 h-6 rounded-full pointer-events-none border-2 border-transparent peer-checked:border-teal-600 peer-checked:bg-gradient-to-br peer-checked:from-teal-400 peer-checked:to-emerald-400 peer-focus:ring-2 peer-focus:ring-teal-300 transition-all duration-200"></span>
                  </span>
                  <span className="text-gray-700 text-lg group-hover:text-teal-700 transition-colors">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
      >
        Submit Answers
      </button>
    </form>
  );
}

export default QuestionsForm;


