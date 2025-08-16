import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/dataService';
import { generateListeningFeedback, saveVocabularyWords, recordPracticeActivity } from '../utils';

const Listening = () => {
  const [selectedLevel, setSelectedLevel] = useState('multipleChoice');
  const [currentPassage, setCurrentPassage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [listeningData, setListeningData] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');
  
  // Removed currentQuestion state to show all questions at once
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const speechRef = useRef(null);
  const timerRef = useRef(null);

  const MAX_PLAYS = 2;
  const TIME_LIMIT = 300; // 5 minutes per passage

  const FEEDBACK_TABS = [
    { key: 'transcription', label: 'Transcription' },
    { key: 'analysis', label: 'Question Analysis' },
    { key: 'vocabulary', label: 'Vocabulary' },
  ];

  // Load listening data
  useEffect(() => {
    const loadListeningData = async () => {
      try {
        const data = await dataService.getPracticeQuestions('listening');
        setListeningData(data);
      } catch (error) {
        console.error('Error loading listening data:', error);
      }
    };

    loadListeningData();
  }, []);

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

  if (!listeningData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listening exercises...</p>
        </div>
      </div>
    );
  }

  const LISTENING_LEVELS = listeningData;
  const currentLevel = LISTENING_LEVELS[selectedLevel];
  const currentPassages = currentLevel.passages;

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
    console.log(`handleAnswerChange: questionId = ${questionId}, value = ${value}, type = ${typeof value}`);
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      };
      console.log('New answers object:', newAnswers);
      return newAnswers;
    });
  };

  const calculateScore = () => {
    const passage = currentPassages[currentPassage];
    let correct = 0;
    let total = passage.questions.length;

    passage.questions.forEach((question) => {
      const userAnswer = answers[question.id];

      if (question.options) {
        // Multiple choice question
        if (userAnswer === question.correct) correct++;
      } else if (question.type === 'fill_blank') {
        if (
          userAnswer &&
          userAnswer.toLowerCase().trim() === (question.answer || question.correct).toLowerCase().trim()
        ) {
          correct++;
        }
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct) correct++;
      }
    });

    return Math.round((correct / total) * 9); // Convert to IELTS band scale
  };

  const handleSubmit = async () => {
    setIsTimerActive(false);
    clearTimeout(timerRef.current);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    
    // Debug: Log the answers object
    console.log('Answers object:', answers);
    console.log('Questions:', questions);
    
    // Generate AI feedback
    setIsAnalyzing(true);
    try {
             // Format answers for AI feedback - convert indices to actual answer text
       const formattedAnswers = {};
       questions.forEach((question, idx) => {
         const userAnswer = answers[question.id];
         console.log(`Question ${question.id}: userAnswer = ${userAnswer}, type = ${typeof userAnswer}`);
         console.log(`Question options:`, question.options);
         console.log(`Question type: ${question.type}`);
         console.log(`Has options: ${!!question.options}`);
         console.log(`User answer check: ${userAnswer !== undefined && userAnswer !== null}`);
         
         if (question.options && userAnswer !== undefined && userAnswer !== null) {
           formattedAnswers[question.id] = question.options[userAnswer];
           console.log(`Formatted answer for ${question.id}: ${formattedAnswers[question.id]}`);
         } else {
           formattedAnswers[question.id] = userAnswer;
           console.log(`Using raw answer for ${question.id}: ${userAnswer}`);
         }
       });
       
       console.log('Formatted answers:', formattedAnswers);

             const feedback = await generateListeningFeedback(
         passage,
         questions,
         formattedAnswers
       );
       
       console.log('AI Feedback received:', feedback);
       
       // Fix the AI feedback to use actual correct answers from our data
       const correctedFeedback = {
         ...feedback,
         question_analysis: feedback.question_analysis?.map((analysis, idx) => {
           const question = questions[idx];
           const userAnswer = answers[question.id];
           
           console.log(`Correcting feedback for question ${idx + 1}:`);
           console.log(`  Question ID: ${question.id}`);
           console.log(`  User answer: ${userAnswer}`);
           console.log(`  Question options:`, question.options);
           console.log(`  Correct answer index: ${question.correct}`);
           
           // Get actual answer text
           let actualCorrectAnswer, actualStudentAnswer;
           if (question.options) {
             actualCorrectAnswer = question.options ? question.options[question.correct] : question.correct;
             actualStudentAnswer = question.options && userAnswer !== undefined && userAnswer !== null
               ? question.options[userAnswer] 
               : 'No answer provided';
             console.log(`  Actual correct answer: ${actualCorrectAnswer}`);
             console.log(`  Actual student answer: ${actualStudentAnswer}`);
           } else {
             actualCorrectAnswer = question.answer || question.correct;
             actualStudentAnswer = userAnswer || 'No answer provided';
           }
          
                     // Determine if the answer is actually correct based on our data
           let isActuallyCorrect = false;
           if (question.options) {
             isActuallyCorrect = userAnswer === question.correct;
           } else if (question.type === 'fill_blank') {
             const userAnswerText = (userAnswer || '').toString().toLowerCase().trim();
             const correctAnswer = (question.answer || question.correct).toString().toLowerCase().trim();
             isActuallyCorrect = userAnswerText === correctAnswer;
           } else if (question.type === 'true_false') {
             isActuallyCorrect = userAnswer === question.correct;
           }
          
                     const correctedAnalysis = {
             ...analysis,
             correct_answer: actualCorrectAnswer,
             student_answer: actualStudentAnswer,
             is_correct: isActuallyCorrect
           };
           console.log(`Corrected analysis for question ${idx + 1}:`, correctedAnalysis);
           return correctedAnalysis;
         }) || []
       };
       
       console.log('Final corrected feedback:', correctedFeedback);
      
      setAiFeedback(correctedFeedback);
      
      // Save vocabulary words from the feedback
      if (feedback.vocabulary_notes && Array.isArray(feedback.vocabulary_notes)) {
        const words = feedback.vocabulary_notes.map(note => 
          typeof note === 'string' ? note : note.word || ''
        ).filter(word => word);
        if (words.length > 0) {
          saveVocabularyWords(words);
        }
      }

      // Record practice activity
      const score = feedback.overall_score || 6.0;
      const band = Math.round(score * 2) / 2; // Round to nearest 0.5
      recordPracticeActivity('listening', score, band, {
        passage: passage.title,
        questionsAnswered: Object.keys(answers).length,
        totalQuestions: questions.length,
        feedback: feedback.overall_feedback
      });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      setAiFeedback(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextPassage = () => {
    if (currentPassage < currentPassages.length - 1) {
      setCurrentPassage((prev) => prev + 1);
      setAnswers({});
      setShowResults(false);
      setAiFeedback(null);
      setActiveTab('transcription');
      setPlayCount(0);
      setTimeRemaining(0);
      setIsTimerActive(false);
      // Removed setCurrentQuestion(0) since all questions are shown at once
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
  // Removed single question selection

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
                   // Removed setCurrentQuestion(0) since all questions are shown at once
                   setAnswers({});
                   setShowResults(false);
                   setAiFeedback(null);
                   setActiveTab('transcription');
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

            </div>
            {/* Timer */}
            {isTimerActive && (
              <div className="text-lg font-bold text-red-600">
                Time remaining: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          {!showResults ? (
            <form
              className="flex flex-col gap-6 mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <h3 className="text-xl font-bold text-teal-700">Questions</h3>
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="font-semibold text-gray-800 mb-3">
                    {`Q${idx + 1}. ${question.question}`}
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
              ))}
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
              >
                Submit Answers
              </button>
            </form>
          ) : (
            <div className="space-y-6 mt-8">
              {/* Score and Navigation */}
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-700">
                  Your Score: Band {score}
                </div>
                <div className="text-lg text-gray-600">
                  Passage {currentPassage + 1} of {currentPassages.length}
                </div>
                {isAnalyzing && (
                  <div className="text-purple-600 text-center font-semibold animate-pulse">
                    Analyzing your answers...
                  </div>
                )}
              </div>

              {/* AI Analysis Section */}
              {aiFeedback && typeof aiFeedback === 'object' ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex mb-4 w-full overflow-x-auto border-b border-blue-200">
                    {FEEDBACK_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        className={`flex-1 min-w-0 px-3 py-2 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                          activeTab === tab.key
                            ? 'border-blue-600 bg-white text-blue-800'
                            : 'border-transparent bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  

                  {/* Transcription Tab */}
                  {activeTab === 'transcription' && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-blue-800 mb-3">
                        Full Passage Transcription
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200 text-gray-700 leading-relaxed">
                        {typeof aiFeedback.transcription === 'string' ? aiFeedback.transcription : JSON.stringify(aiFeedback.transcription)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Tip:</strong> Read through the transcription to see what you might have missed while listening.
                      </div>
                    </div>
                  )}

                  {/* Question Analysis Tab */}
                  {activeTab === 'analysis' && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-blue-800 mb-3">
                        Detailed Question Analysis
                      </div>
                                                                    {aiFeedback.question_analysis?.map((analysis, idx) => (
                         <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                           <div className="flex items-center gap-2 mb-2">
                             <span className={`px-2 py-1 rounded text-xs font-semibold ${
                               analysis.is_correct 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-red-100 text-red-800'
                             }`}>
                               {analysis.is_correct ? '✓ Correct' : '✗ Incorrect'}
                             </span>
                             <span className="font-semibold text-blue-800">
                               Question {analysis.question_number}
                             </span>
                           </div>
                           <div className="text-sm text-gray-700 mb-2">
                             <strong>Question:</strong> {analysis.question_text}
                           </div>
                                                       <div className="text-sm text-gray-700 mb-2">
                              <strong>Your Answer:</strong> {analysis.student_answer}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              <strong>Correct Answer:</strong> {analysis.correct_answer}
                            </div>
                           <div className="text-sm text-gray-700 mb-2">
                             <strong>Explanation:</strong> {analysis.explanation}
                           </div>
                           <div className="text-sm text-gray-700 mb-2">
                             <strong>Listening Tip:</strong> {analysis.listening_tips}
                           </div>
                           <div className="text-sm text-gray-700">
                             <strong>Key Vocabulary:</strong> {analysis.key_vocabulary?.join(', ')}
                           </div>
                         </div>
                       ))}
                    </div>
                  )}

                  {/* Vocabulary Tab */}
                  {activeTab === 'vocabulary' && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-blue-800 mb-3">
                        Important Vocabulary
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiFeedback.vocabulary_notes?.map((vocab, idx) => {
                          // Handle different vocabulary data structures
                          let word, definition;
                          if (typeof vocab === 'string') {
                            word = vocab;
                            definition = 'Definition not available';
                          } else if (vocab && typeof vocab === 'object') {
                            word = vocab.word || vocab.mistake || 'Unknown word';
                            definition = vocab.definition || vocab.solution || 'Definition not available';
                          } else {
                            word = 'Unknown word';
                            definition = 'Definition not available';
                          }
                          
                          return (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="font-semibold text-blue-800 mb-1">
                                {word}
                              </div>
                              <div className="text-sm text-gray-700">
                                {definition}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-center text-gray-600">
                    <p>AI feedback is not available at the moment.</p>
                    <p className="text-sm mt-2">Your score has been calculated successfully.</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="text-center">
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
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 mt-8 md:mt-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">
              Questions
            </div>
            {currentPassages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                                     setCurrentPassage(idx);
                   setAnswers({});
                   setShowResults(false);
                   setAiFeedback(null);
                   setActiveTab('transcription');
                   setPlayCount(0);
                   setTimeRemaining(0);
                   setIsTimerActive(false);
                   if (speechRef.current) {
                     window.speechSynthesis.cancel();
                   }
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                  currentPassage === idx
                    ? 'bg-teal-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                }`}
              >
                Passage {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listening;
