import React from 'react';
import Icon from '../../components/Icon';

const SpeakingQuestionBlock = ({ question, answersSection, isRecording, startRecording, stopRecording }) => {
  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Speaking Part {question.part || 'Unknown'}</h3>
        <h4 className="text-lg font-medium mb-4">{question.title || 'Speaking Question'}</h4>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h5 className="font-medium mb-2">Question:</h5>
            <p className="whitespace-pre-line">{question.question || 'Question not available'}</p>
          </div>

          {question.part === 2 && question.preparationTime && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Preparation Time: {question.preparationTime} seconds</h5>
              <p className="text-sm text-gray-600">You have {question.preparationTime} seconds to prepare your answer.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={startRecording}
                disabled={isRecording}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Icon name="mic" className="w-5 h-5" />
                {isRecording ? 'Recording...' : 'Start Recording'}
              </button>

              {isRecording && (
                <button onClick={stopRecording} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                  Stop Recording
                </button>
              )}
            </div>

            {answersSection[question.id] && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Your Answer:</h5>
                <p className="text-gray-700">{answersSection[question.id]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingQuestionBlock;


