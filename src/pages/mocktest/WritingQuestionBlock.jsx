import React from 'react';

const WritingQuestionBlock = ({ question, answersSection, onAnswer, formatTime }) => {
  if (!question) return null;

  const wordCount = (answersSection[question.id]?.split(/\s+/).filter((w) => w.length > 0).length) || 0;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          Writing {question.type === 'task1' ? 'Task 1: Letter Writing' : 'Task 2: Essay Writing'}
        </h3>
        <h4 className="text-lg font-medium mb-4">{question.title || 'Writing Task'}</h4>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h5 className="font-medium mb-2">Question:</h5>
            <p className="text-gray-700">{question.question || 'Question not available'}</p>

            {question.type === 'task1' && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h6 className="font-medium text-blue-800 mb-2">Task 1: Letter Writing</h6>
                <p className="text-sm text-blue-700">
                  Write a formal or informal letter based on the situation described above. Remember to include appropriate
                  greetings, body paragraphs, and closing.
                  <strong>Time: 20 minutes | Words: 150-200</strong>
                </p>
              </div>
            )}

            {question.type === 'task2' && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <h6 className="font-medium text-green-800 mb-2">Task 2: Essay Writing</h6>
                <p className="text-sm text-green-700">
                  Write an essay responding to the given topic. Include an introduction, body paragraphs with supporting arguments,
                  and a conclusion.
                  <strong>Time: 40 minutes | Words: 250-300</strong>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Time limit: {formatTime(question.timeLimit)}</span>
              <span>Word limit: {question.wordLimit}</span>
            </div>

            <textarea
              value={answersSection[question.id] || ''}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Write your answer here..."
            />

            <div className="text-sm text-gray-600">Word count: {wordCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingQuestionBlock;


