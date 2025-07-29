import React, { useState } from 'react';

const READING_PASSAGES = {
  multipleChoice: {
    name: 'Multiple Choice',
    description: 'Choose the best answer from given options',
    passage: `The honeybee is a remarkable insect known for its role in pollination and for producing honey and beeswax. Honeybees live in well-organized colonies and communicate with each other through a unique dance language. Their work is essential for the growth of many crops and wild plants.`,
    questions: [
      {
        text: 'What is one important role of the honeybee?',
        options: [
          'They make silk for clothing.',
          'They pollinate plants and crops.',
          'They eat harmful insects.',
          'They live alone in the wild.',
        ],
        correct: 1,
      },
      {
        text: 'How do honeybees communicate with each other?',
        options: [
          'Through vocal sounds',
          'Through a unique dance language',
          'Through chemical signals only',
          'Through physical contact',
        ],
        correct: 1,
      },
    ],
  },
  trueFalse: {
    name: 'True / False / Not Given',
    description: 'Determine if statements are true, false, or not mentioned',
    passage: `Climate change is affecting global weather patterns. Scientists have observed increased temperatures worldwide, leading to more extreme weather events. Some regions are experiencing longer droughts, while others face increased rainfall and flooding.`,
    questions: [
      {
        text: 'Global temperatures have increased in recent years.',
        options: ['True', 'False', 'Not Given'],
        correct: 0,
      },
      {
        text: 'All regions are experiencing drought conditions.',
        options: ['True', 'False', 'Not Given'],
        correct: 1,
      },
      {
        text: 'Scientists use satellites to monitor climate change.',
        options: ['True', 'False', 'Not Given'],
        correct: 2,
      },
    ],
  },
  yesNo: {
    name: 'Yes / No / Not Given',
    description: 'Answer yes, no, or not given based on the passage',
    passage: `The Great Barrier Reef is the world's largest coral reef system. It is home to thousands of marine species and is a popular tourist destination. However, it faces threats from climate change and pollution. Conservation efforts are ongoing to protect this natural wonder.`,
    questions: [
      {
        text: 'Is the Great Barrier Reef the largest coral reef system?',
        options: ['Yes', 'No', 'Not Given'],
        correct: 0,
      },
      {
        text: 'Are there conservation efforts to protect the reef?',
        options: ['Yes', 'No', 'Not Given'],
        correct: 0,
      },
      {
        text: 'Is the reef located in the Pacific Ocean?',
        options: ['Yes', 'No', 'Not Given'],
        correct: 2,
      },
    ],
  },
  matching: {
    name: 'Matching',
    description: 'Match headings, information, or features',
    passage: `A) Solar energy is renewable and environmentally friendly. B) Wind power requires large turbines and open spaces. C) Hydroelectric power uses flowing water to generate electricity. D) Nuclear power produces large amounts of energy but creates radioactive waste.`,
    questions: [
      {
        text: 'Match each energy source with its main characteristic:',
        options: [
          'Solar - Renewable and clean',
          'Wind - Requires turbines',
          'Hydroelectric - Uses water flow',
          'Nuclear - Produces waste',
        ],
        correct: [0, 1, 2, 3],
        matching: true,
      },
    ],
  },
  completion: {
    name: 'Sentence Completion',
    description: 'Complete sentences with words from the passage',
    passage: `The human brain contains approximately 86 billion neurons. These neurons communicate through electrical and chemical signals. The brain is responsible for all our thoughts, emotions, and actions. It continues to develop throughout our lives.`,
    questions: [
      {
        text: 'Complete the sentence: The human brain contains about _____ billion neurons.',
        answer: '86',
        type: 'completion',
      },
      {
        text: 'Neurons communicate through _____ and chemical signals.',
        answer: 'electrical',
        type: 'completion',
      },
    ],
  },
  diagram: {
    name: 'Diagram Labeling',
    description: 'Label parts of a diagram using information from the text',
    passage: `The water cycle consists of four main stages: evaporation, condensation, precipitation, and collection. Water evaporates from oceans and lakes, condenses into clouds, falls as rain or snow, and collects back into water bodies.`,
    questions: [
      {
        text: 'Label the water cycle stages:',
        options: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
        correct: [0, 1, 2, 3],
        type: 'diagram',
      },
    ],
  },
  shortAnswer: {
    name: 'Short Answer Questions',
    description: 'Answer questions briefly using words from the passage',
    passage: `The Internet was developed in the 1960s as a military project called ARPANET. It was designed to allow computers to communicate even if some connections were destroyed. Today, the Internet connects billions of people worldwide.`,
    questions: [
      {
        text: 'What was the original name of the Internet?',
        answer: 'ARPANET',
        type: 'shortAnswer',
      },
      {
        text: 'When was the Internet first developed?',
        answer: '1960s',
        type: 'shortAnswer',
      },
    ],
  },
};

const Reading = () => {
  const [selectedType, setSelectedType] = useState('multipleChoice');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const currentPassage = READING_PASSAGES[selectedType];
  const currentQuestions = currentPassage.questions;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setSelected(null);
    setAnswers({});
    setSubmitted(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelected(null);
      setAnswers({});
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Reading Test
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(READING_PASSAGES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedType(key);
                  setCurrentQuestion(0);
                  setSelected(null);
                  setAnswers({});
                  setSubmitted(false);
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  selectedType === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{type.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full  bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-teal-700 mb-2">
            {currentPassage.name}
          </h2>
        </div>
        <div className="text-gray-800 text-lg leading-relaxed mb-6 whitespace-pre-line">
          {currentPassage.passage}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="font-semibold text-gray-700 mb-2">
            {currentQuestions[currentQuestion].text}
          </div>
          <div className="flex flex-col gap-3">
            {currentQuestions[currentQuestion].options ? (
              currentQuestions[currentQuestion].options.map((option, idx) => (
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
              ))
            ) : (
              <input
                type="text"
                value={answers[currentQuestion] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentQuestion]: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                placeholder="Type your answer..."
                required
              />
            )}
          </div>
          {!submitted ? (
            <div className="flex gap-3 justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
                disabled={
                  currentQuestions[currentQuestion].options
                    ? selected === null
                    : !answers[currentQuestion]
                }
              >
                Submit
              </button>
              {currentQuestion < currentQuestions.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
                >
                  Next Question
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              {currentQuestions[currentQuestion].options ? (
                selected === currentQuestions[currentQuestion].correct ? (
                  <div className="text-green-700 font-bold text-lg">
                    Correct! 🎉
                  </div>
                ) : (
                  <div className="text-red-600 font-bold text-lg">
                    Incorrect. The correct answer is:{' '}
                    <span className="underline">
                      {
                        currentQuestions[currentQuestion].options[
                          currentQuestions[currentQuestion].correct
                        ]
                      }
                    </span>
                  </div>
                )
              ) : (
                <div className="text-green-700 font-bold text-lg">
                  Answer submitted! Check with your teacher or study materials.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
                >
                  Try Another
                </button>
                {currentQuestion < currentQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-2 px-6 rounded-2xl shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Reading;
