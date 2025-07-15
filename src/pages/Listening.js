import React, { useState, useEffect, useRef } from 'react';

const listeningPassages = [
  {
    id: 1,
    title: "University Campus Tour",
    text: "Welcome to our university campus. The main library is located in the center of campus, next to the student union building. The library is open from 8 AM to 10 PM on weekdays, and 9 AM to 6 PM on weekends. There are over 500,000 books and 50 study rooms available. The cafeteria is on the first floor of the student union, serving breakfast from 7 AM to 10 AM, lunch from 11 AM to 2 PM, and dinner from 5 PM to 8 PM. The gymnasium is behind the library and offers fitness classes every day. Parking is available in the north and south lots, with the north lot being closer to the main buildings.",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "What time does the library close on weekdays?",
        options: ["8 PM", "9 PM", "10 PM", "11 PM"],
        correct: 2
      },
      {
        id: 2,
        type: "fill_blank",
        question: "The cafeteria serves dinner from _____ to _____.",
        answer: "5 PM to 8 PM"
      },
      {
        id: 3,
        type: "multiple_choice",
        question: "Where is the gymnasium located?",
        options: ["Next to the library", "Behind the library", "In front of the library", "Inside the library"],
        correct: 1
      },
      {
        id: 4,
        type: "true_false",
        question: "The north parking lot is closer to the main buildings than the south lot.",
        correct: true
      }
    ]
  },
  {
    id: 2,
    title: "Job Interview Conversation",
    text: "Interviewer: Good morning, Sarah. Thank you for coming in today. Let's start with your background. I see you have a degree in marketing and three years of experience. Can you tell me about your previous role? Sarah: Thank you for having me. In my previous position at ABC Company, I was responsible for managing social media campaigns and analyzing customer data. I increased our online engagement by 40% and helped launch two successful product campaigns. Interviewer: That's impressive. What would you say is your biggest strength? Sarah: I believe my strongest skill is my ability to analyze data and translate it into actionable marketing strategies. I'm also very organized and can manage multiple projects simultaneously. Interviewer: How do you handle working under pressure? Sarah: I actually work well under pressure. I prioritize tasks, set realistic deadlines, and communicate clearly with my team. In my last role, I successfully managed a campaign launch during a major company restructuring.",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "How many years of experience does Sarah have?",
        options: ["2 years", "3 years", "4 years", "5 years"],
        correct: 1
      },
      {
        id: 2,
        type: "fill_blank",
        question: "Sarah increased online engagement by _____ percent.",
        answer: "40"
      },
      {
        id: 3,
        type: "multiple_choice",
        question: "What does Sarah consider her biggest strength?",
        options: ["Social media management", "Data analysis", "Team leadership", "Project organization"],
        correct: 1
      },
      {
        id: 4,
        type: "true_false",
        question: "Sarah managed a campaign launch during a company restructuring.",
        correct: true
      }
    ]
  }
];

const Listening = () => {
  const [currentPassage, setCurrentPassage] = useState(0);
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

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
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
    const passage = listeningPassages[currentPassage];
    
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
        setPlayCount(prev => prev + 1);
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    const passage = listeningPassages[currentPassage];
    let correct = 0;
    let total = passage.questions.length;

    passage.questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correct) correct++;
      } else if (question.type === 'fill_blank') {
        if (userAnswer && userAnswer.toLowerCase().includes(question.answer.toLowerCase())) {
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
    if (currentPassage < listeningPassages.length - 1) {
      setCurrentPassage(prev => prev + 1);
      setAnswers({});
      setShowResults(false);
      setPlayCount(0);
      setTimeRemaining(0);
      setIsTimerActive(false);
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

  const passage = listeningPassages[currentPassage];

  return (
    <>
      <div className="min-h-screen bg-gray-50 relative overflow-hidden"> {/* Neutral background */}
        {/* Removed Animated Background Elements */}
        {/* Removed Floating Particles */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-teal-700 mb-4 drop-shadow-lg"> {/* Single accent color */}
            Listening Quest
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Listen to the passage and answer the questions to earn XP!
          </p>
        </div>
        <div className="relative w-full max-w-3xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12"> {/* Neutral card */}
            <div className="mb-4 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700 mb-4 tracking-tight flex items-center justify-center gap-3">
                <span role="img" aria-label="headphones" className="text-4xl">🎧</span> IELTS Listening Test
              </h1>
              <div className="text-xl font-semibold text-gray-800 text-center bg-teal-50 border border-teal-200 rounded-xl py-4 px-4 shadow">
                {passage.title}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={isPlaying ? stopListening : startListening}
                  disabled={isLoading || playCount >= MAX_PLAYS}
                  className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  } ${(isLoading || playCount >= MAX_PLAYS) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            {/* Questions */}
            {!showResults && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-teal-700">Questions:</h3>
                {passage.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-3">
                      {index + 1}. {question.question}
                    </div>
                    
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center gap-3 cursor-pointer group">
                            <span className="relative flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={optionIndex}
                                checked={answers[question.id] === optionIndex}
                                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                                className="peer appearance-none w-6 h-6 rounded-full border-2 border-teal-400 bg-white checked:bg-gradient-to-br checked:from-teal-400 checked:to-emerald-400 checked:border-teal-600 transition-all duration-200 focus:ring-2 focus:ring-teal-300 shadow-sm"
                              />
                              <span className="absolute left-0 top-0 w-6 h-6 rounded-full pointer-events-none border-2 border-transparent peer-checked:border-teal-600 peer-checked:bg-gradient-to-br peer-checked:from-teal-400 peer-checked:to-emerald-400 peer-focus:ring-2 peer-focus:ring-teal-300 transition-all duration-200"></span>
                            </span>
                            <span className="text-gray-700 text-lg group-hover:text-teal-700 transition-colors">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'fill_blank' && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    )}
                    
                    {question.type === 'true_false' && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span className="relative flex items-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={true}
                              checked={answers[question.id] === true}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value === 'true')}
                              className="peer appearance-none w-6 h-6 rounded-full border-2 border-teal-400 bg-white checked:bg-gradient-to-br checked:from-teal-400 checked:to-emerald-400 checked:border-teal-600 transition-all duration-200 focus:ring-2 focus:ring-teal-300 shadow-sm"
                            />
                            <span className="absolute left-0 top-0 w-6 h-6 rounded-full pointer-events-none border-2 border-transparent peer-checked:border-teal-600 peer-checked:bg-gradient-to-br peer-checked:from-teal-400 peer-checked:to-emerald-400 peer-focus:ring-2 peer-focus:ring-teal-300 transition-all duration-200"></span>
                          </span>
                          <span className="text-gray-700 text-lg group-hover:text-teal-700 transition-colors">True</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span className="relative flex items-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={false}
                              checked={answers[question.id] === false}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value === 'true')}
                              className="peer appearance-none w-6 h-6 rounded-full border-2 border-teal-400 bg-white checked:bg-gradient-to-br checked:from-teal-400 checked:to-emerald-400 checked:border-teal-600 transition-all duration-200 focus:ring-2 focus:ring-teal-300 shadow-sm"
                            />
                            <span className="absolute left-0 top-0 w-6 h-6 rounded-full pointer-events-none border-2 border-transparent peer-checked:border-teal-600 peer-checked:bg-gradient-to-br peer-checked:from-teal-400 peer-checked:to-emerald-400 peer-focus:ring-2 peer-focus:ring-teal-300 transition-all duration-200"></span>
                          </span>
                          <span className="text-gray-700 text-lg group-hover:text-teal-700 transition-colors">False</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
                >
                  Submit Answers
                </button>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-700">
                  Your Score: Band {score}
                </div>
                <div className="text-lg text-gray-600">
                  Passage {currentPassage + 1} of {listeningPassages.length}
                </div>
                
                {currentPassage < listeningPassages.length - 1 ? (
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
        </div>
      </div>
    </>
  );
};

export default Listening; 