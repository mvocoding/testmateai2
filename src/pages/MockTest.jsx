import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dataService from '../services/dataService';

const MockTest = () => {
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    listening: {},
    speaking: {},
    reading: {},
    writing: {},
  });
  const [timeRemaining, setTimeRemaining] = useState({
    listening: 30 * 60, // 30 minutes
    speaking: 15 * 60, // 15 minutes
    reading: 60 * 60, // 60 minutes
    writing: 60 * 60, // 60 minutes
  });
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRef] = useState(useRef(null));
  const [recognitionRef] = useState(useRef(null));
  const [testData, setTestData] = useState(null);
  const [sections, setSections] = useState([]);

    // Load mock test data
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const mockTest = await dataService.fetchMockTest(1); // Load first mock test
        if (mockTest) {
          setTestData(mockTest.questions);
          setSections(mockTest.sections);
          
          // Update time remaining based on loaded sections
          const newTimeRemaining = {};
          mockTest.sections.forEach(section => {
            const minutes = parseInt(section.time.split(' ')[0]);
            newTimeRemaining[section.id] = minutes * 60;
          });
          setTimeRemaining(newTimeRemaining);
        }
      } catch (error) {
        console.error('Error loading mock test data:', error);
      }
    };

    loadTestData();
  }, []);

  useEffect(() => {
    let interval;
    if (isTestStarted && timeRemaining[currentSection] > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => ({
          ...prev,
          [currentSection]: prev[currentSection] - 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestStarted, currentSection, timeRemaining]);

  const startTest = () => {
    setIsTestStarted(true);
  };

  const handleAnswer = (section, questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: answer,
      },
    }));
  };

  const nextQuestion = () => {
    if (!testData || !testData[currentSection]) return;
    
    const currentQuestions = testData[currentSection];
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Move to next section
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex < sections.length - 1) {
        setCurrentSection(sections[sectionIndex + 1].id);
        setCurrentQuestion(0);
      }
    }
  };

  const prevQuestion = () => {
    if (!testData) return;
    
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      // Move to previous section
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex > 0) {
        setCurrentSection(sections[sectionIndex - 1].id);
        setCurrentQuestion(testData[sections[sectionIndex - 1].id].length - 1);
      }
    }
  };

  const startSpeakingRecording = () => {
    if (
      !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (testData && testData.speaking && testData.speaking[currentQuestion]) {
        handleAnswer(
          'speaking',
          testData.speaking[currentQuestion].id,
          transcript
        );
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeakingRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    if (!testData || !testData[currentSection]) {
      return <div className="text-center py-8">Loading questions...</div>;
    }
    
    const currentQuestions = testData[currentSection];
    const question = currentQuestions[currentQuestion];

    switch (currentSection) {
      case 'listening':
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                Audio Question {question.id}
              </h3>
              <audio ref={audioRef} controls className="w-full">
                <source src={question.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">{question.question}</h4>

              {question.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`listening-${question.id}`}
                        value={index}
                        checked={answers.listening[question.id] === index}
                        onChange={(e) =>
                          handleAnswer(
                            'listening',
                            question.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="text-teal-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'fill-blank' && (
                <input
                  type="text"
                  value={answers.listening[question.id] || ''}
                  onChange={(e) =>
                    handleAnswer('listening', question.id, e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Type your answer here..."
                />
              )}

              {question.type === 'true-false' && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`listening-${question.id}`}
                      value="true"
                      checked={answers.listening[question.id] === true}
                      onChange={() =>
                        handleAnswer('listening', question.id, true)
                      }
                      className="text-teal-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`listening-${question.id}`}
                      value="false"
                      checked={answers.listening[question.id] === false}
                      onChange={() =>
                        handleAnswer('listening', question.id, false)
                      }
                      className="text-teal-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 'speaking':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Speaking Part {question.part}
              </h3>
              <h4 className="text-lg font-medium mb-4">{question.title}</h4>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Question:</h5>
                  <p className="whitespace-pre-line">{question.question}</p>
                </div>

                {question.part === 2 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">
                      Preparation Time: {question.preparationTime} seconds
                    </h5>
                    <p className="text-sm text-gray-600">
                      You have {question.preparationTime} seconds to prepare
                      your answer.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={startSpeakingRecording}
                      disabled={isRecording}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      {isRecording ? 'Recording...' : 'Start Recording'}
                    </button>

                    {isRecording && (
                      <button
                        onClick={stopSpeakingRecording}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
                      >
                        Stop Recording
                      </button>
                    )}
                  </div>

                  {answers.speaking[question.id] && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Your Answer:</h5>
                      <p className="text-gray-700">
                        {answers.speaking[question.id]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'reading':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Reading Question {question.id}
              </h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Passage:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {question.passage}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">{question.question}</h4>

                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`reading-${question.id}`}
                            value={index}
                            checked={answers.reading[question.id] === index}
                            onChange={(e) =>
                              handleAnswer(
                                'reading',
                                question.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="text-teal-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`reading-${question.id}`}
                          value="true"
                          checked={answers.reading[question.id] === true}
                          onChange={() =>
                            handleAnswer('reading', question.id, true)
                          }
                          className="text-teal-600"
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`reading-${question.id}`}
                          value="false"
                          checked={answers.reading[question.id] === false}
                          onChange={() =>
                            handleAnswer('reading', question.id, false)
                          }
                          className="text-teal-600"
                        />
                        <span>False</span>
                      </label>
                    </div>
                  )}

                  {question.type === 'fill-blank' && (
                    <input
                      type="text"
                      value={answers.reading[question.id] || ''}
                      onChange={(e) =>
                        handleAnswer('reading', question.id, e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Type your answer here..."
                    />
                  )}

                  {question.type === 'matching' && (
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <span className="font-medium">{option.source}:</span>
                          <input
                            type="text"
                            value={
                              answers.reading[`${question.id}-${index}`] || ''
                            }
                            onChange={(e) =>
                              handleAnswer(
                                'reading',
                                `${question.id}-${index}`,
                                e.target.value
                              )
                            }
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                            placeholder="Match with characteristic..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'writing':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Writing {question.type === 'task1' ? 'Task 1' : 'Task 2'}
              </h3>
              <h4 className="text-lg font-medium mb-4">{question.title}</h4>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Question:</h5>
                  <p className="text-gray-700">{question.question}</p>

                  {question.type === 'task1' && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p className="text-sm text-gray-600">
                        Chart data will be displayed here
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
                    value={answers.writing[question.id] || ''}
                    onChange={(e) =>
                      handleAnswer('writing', question.id, e.target.value)
                    }
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder="Write your answer here..."
                  />

                  <div className="text-sm text-gray-600">
                    Word count:{' '}
                    {answers.writing[question.id]
                      ?.split(/\s+/)
                      .filter((word) => word.length > 0).length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-teal-600 hover:text-teal-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                IELTS Mock Test
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete IELTS Mock Test
            </h2>
            <p className="text-gray-600 mb-8">
              This mock test includes all four sections: Listening, Speaking,
              Reading, and Writing. Total duration: 2 hours 45 minutes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {sections.length > 0 ? (
                sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white p-6 rounded-lg border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
                    <p className="text-gray-600 mb-2">{section.time}</p>
                    <p className="text-sm text-gray-500">
                      {section.questions} questions
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading test sections...</p>
                </div>
              )}
            </div>

            <button
              onClick={startTest}
              className="bg-teal-600 text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition-colors text-lg font-semibold"
            >
              Start Mock Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-teal-600 hover:text-teal-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              IELTS Mock Test
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {sections.find((s) => s.id === currentSection)?.name} - Question{' '}
              {currentQuestion + 1} of {testData[currentSection].length}
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-medium">
              {formatTime(timeRemaining[currentSection])}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Test Sections</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSection(section.id);
                  setCurrentQuestion(0);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentSection === section.id
                    ? 'bg-teal-100 text-teal-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{section.name}</div>
                <div className="text-sm text-gray-600">{section.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {renderQuestion()}

            <div className="flex justify-between mt-8">
              <button
                onClick={prevQuestion}
                disabled={
                  !testData ||
                  currentQuestion === 0 &&
                  sections.findIndex((s) => s.id === currentSection) === 0
                }
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={nextQuestion}
                disabled={
                  !testData ||
                  currentQuestion === testData[currentSection].length - 1 &&
                  sections.findIndex((s) => s.id === currentSection) ===
                    sections.length - 1
                }
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTest;
