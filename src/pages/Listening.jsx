import React, { useState, useEffect, useRef } from 'react';

const LISTENING_LEVELS = {
  multipleChoice: {
    name: 'Multiple Choice',
    description: 'Choose the best answer from given options',
    passages: [
      {
        id: 1,
        title: 'University Campus Tour',
        text: 'Welcome to our university campus. The main library is located in the center of campus, next to the student union building. The library is open from 8 AM to 10 PM on weekdays, and 9 AM to 6 PM on weekends. There are over 500,000 books and 50 study rooms available.',
        questions: [
          {
            id: 1,
            question: 'What time does the library close on weekdays?',
            options: ['8 PM', '9 PM', '10 PM', '11 PM'],
            correct: 2,
          },
          {
            id: 2,
            question: 'How many books are available in the library?',
            options: ['400,000', '500,000', '600,000', '700,000'],
            correct: 1,
          },
        ],
      },
    ],
  },
  matching: {
    name: 'Matching',
    description: 'Match names with activities or information',
    passages: [
      {
        id: 1,
        title: 'Student Activities Meeting',
        text: 'John is organizing the photography club, Mary leads the debate team, David runs the chess club, and Sarah manages the drama society. The photography club meets on Mondays, debate team on Wednesdays, chess club on Fridays, and drama society on Saturdays.',
        questions: [
          {
            id: 1,
            question: 'Match each person with their activity:',
            options: [
              'John - Photography club',
              'Mary - Debate team',
              'David - Chess club',
              'Sarah - Drama society',
            ],
            correct: [0, 1, 2, 3],
            matching: true,
          },
        ],
      },
    ],
  },
  sentenceCompletion: {
    name: 'Sentence Completion',
    description: 'Complete sentences with words from the audio',
    passages: [
      {
        id: 1,
        title: 'Weather Forecast',
        text: 'Today will be sunny with a high temperature of 25 degrees Celsius. There is a 20% chance of rain in the afternoon. The wind will be light, around 10 kilometers per hour.',
        questions: [
          {
            id: 1,
            question:
              'The high temperature today will be _____ degrees Celsius.',
            answer: '25',
            type: 'completion',
          },
          {
            id: 2,
            question: 'There is a _____ percent chance of rain.',
            answer: '20',
            type: 'completion',
          },
        ],
      },
    ],
  },
  shortAnswer: {
    name: 'Short Answer Questions',
    description: 'Answer questions briefly using words from the audio',
    passages: [
      {
        id: 1,
        title: 'Travel Information',
        text: 'The train to London departs from platform 3 at 2:30 PM. The journey takes approximately 2 hours and 15 minutes. The ticket price is 45 pounds for adults and 25 pounds for children.',
        questions: [
          {
            id: 1,
            question: 'What platform does the train depart from?',
            answer: 'platform 3',
            type: 'shortAnswer',
          },
          {
            id: 2,
            question: 'How much does an adult ticket cost?',
            answer: '45 pounds',
            type: 'shortAnswer',
          },
        ],
      },
    ],
  },
};

const Listening = () => {
  const [selectedLevel, setSelectedLevel] = useState('multipleChoice');
  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const speechRef = useRef(null);
  const timerRef = useRef(null);

  const MAX_PLAYS = 2;
  const TIME_LIMIT = 300; // 5 minutes per passage

  const currentLevel = LISTENING_LEVELS[selectedLevel];
  const currentPassages = currentLevel.passages;

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeRemaining, isTimerActive]);

  const startListening = () => {
    if (playCount >= MAX_PLAYS) {
      alert(`You can only play the audio ${MAX_PLAYS} times.`);
      return;
    }

    setIsLoading(true);
    const passage = currentPassages[currentPassage];

    if ('speechSynthesis' in window) {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(passage.text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setPlayCount((prev) => prev + 1);
        if (!isTimerActive) {
          setIsTimerActive(true);
          setTimeRemaining(TIME_LIMIT);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        alert('Error playing audio. Please try again.');
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
      setIsLoading(false);
    }
  };

  const stopListening = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const calculateScore = () => {
    const passage = currentPassages[currentPassage];
    let correct = 0;
    let total = passage.questions.length;

    passage.questions.forEach((question) => {
      const userAnswer = answers[question.id];

      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correct) correct++;
      } else if (question.type === 'fill_blank') {
        if (
          userAnswer &&
          userAnswer.toLowerCase().includes(question.answer.toLowerCase())
        ) {
          correct++;
        }
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct) correct++;
      }
    });

    return Math.round((correct / total) * 9); // Convert to IELTS band scale
  };

  const handleSubmit = () => {
    setIsTimerActive(false);
    clearTimeout(timerRef.current);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const handleNextPassage = () => {
    if (currentPassage < currentPassages.length - 1) {
      setCurrentPassage((prev) => prev + 1);
      setAnswers({});
      setShowResults(false);
      setPlayCount(0);
      setTimeRemaining(0);
      setIsTimerActive(false);
      setCurrentQuestion(0);
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const passage = currentPassages[currentPassage];
  const questions = passage.questions;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Listening Test
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(LISTENING_LEVELS).map(([key, level]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedLevel(key);
                  setCurrentPassage(0);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                  setPlayCount(0);
                  setTimeRemaining(0);
                  setIsTimerActive(false);
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  selectedLevel === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{level.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
          <div className="mb-4 text-center">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-teal-700 mb-2">
                {currentLevel.name}
              </h2>
            </div>
            <div className="text-xl font-semibold text-gray-800 text-center bg-teal-50 border border-teal-200 rounded-xl p-2">
              {passage.title}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={isPlaying ? stopListening : startListening}
                disabled={isLoading || playCount >= MAX_PLAYS}
                className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-teal-500 hover:bg-teal-600'
                } ${
                  isLoading || playCount >= MAX_PLAYS
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <span role="img" aria-label="audio">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
                {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play Audio'}
              </button>
              <div className="text-sm text-gray-600">
                Plays remaining: {MAX_PLAYS - playCount}
              </div>
            </div>
            {/* Timer */}
            {isTimerActive && (
              <div className="text-lg font-bold text-red-600">
                Time remaining: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          {!showResults ? (
            <div className="flex flex-col gap-6 mt-8">
              <h3 className="text-xl font-bold text-teal-700">
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="font-semibold text-gray-800 mb-3">
                  {question.question}
                </div>
                {question.options ? (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <span className="relative flex items-center">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionIndex}
                            checked={answers[question.id] === optionIndex}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                parseInt(e.target.value)
                              )
                            }
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
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    placeholder="Type your answer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                )}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  onClick={() =>
                    setCurrentQuestion((q) =>
                      Math.min(questions.length - 1, q + 1)
                    )
                  }
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
                >
                  Submit Answers
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 mt-8">
              <div className="text-2xl font-bold text-green-700">
                Your Score: Band {score}
              </div>
              <div className="text-lg text-gray-600">
                Passage {currentPassage + 1} of {currentPassages.length}
              </div>
              {currentPassage < currentPassages.length - 1 ? (
                <button
                  onClick={handleNextPassage}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
                >
                  Next Passage
                </button>
              ) : (
                <div className="text-xl font-bold text-green-700">
                  🎉 All passages completed!
                </div>
              )}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 mt-8 md:mt-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">
              Questions
            </div>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                  currentQuestion === idx
                    ? 'bg-teal-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                }`}
              >
                Question {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listening;
