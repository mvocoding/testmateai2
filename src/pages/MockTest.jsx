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
  const [showingIntroduction, setShowingIntroduction] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRef] = useState(useRef(null));
  const [recognitionRef] = useState(useRef(null));
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState({
    listening: [],
    speaking: [],
    reading: [],
    writing: []
  });
  
  // Test completion and results states
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Audio states for listening section
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [speechRef] = useState(useRef(null));
  
  const MAX_PLAYS = 2;

  // Calculate scores for each section
  const calculateSectionScore = (sectionId) => {
    const sectionAnswers = answers[sectionId] || {};
    const sectionQuestions = questions[sectionId] || [];
    let correctAnswers = 0;
    let totalQuestions = 0;

    sectionQuestions.forEach((question, index) => {
      if (question.type === 'passage' && question.questions) {
        // For passage-type questions, check each sub-question
        question.questions.forEach((subQuestion, subIndex) => {
          totalQuestions++;
          const answerKey = `${question.id}-${subIndex}`;
          const userAnswer = sectionAnswers[answerKey];
          
          if (subQuestion.correct !== undefined) {
            // Multiple choice or true/false
            if (userAnswer === subQuestion.correct) {
              correctAnswers++;
            }
          } else if (subQuestion.answer) {
            // Short answer or completion
            if (userAnswer && userAnswer.toString().toLowerCase().trim() === 
                subQuestion.answer.toString().toLowerCase().trim()) {
              correctAnswers++;
            }
          }
        });
      } else {
        // For individual questions
        totalQuestions++;
        const userAnswer = sectionAnswers[question.id];
        
        if (question.correct !== undefined) {
          if (userAnswer === question.correct) {
            correctAnswers++;
          }
        } else if (question.answer) {
          if (userAnswer && userAnswer.toString().toLowerCase().trim() === 
              question.answer.toString().toLowerCase().trim()) {
            correctAnswers++;
          }
        }
      }
    });

    return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  };

  // Calculate overall IELTS band score
  const calculateOverallScore = () => {
    const listeningScore = calculateSectionScore('listening');
    const readingScore = calculateSectionScore('reading');
    const writingScore = calculateSectionScore('writing');
    const speakingScore = calculateSectionScore('speaking');

    // Convert percentage to IELTS band score (simplified)
    const convertToBandScore = (percentage) => {
      if (percentage >= 90) return 9.0;
      if (percentage >= 80) return 8.0;
      if (percentage >= 70) return 7.0;
      if (percentage >= 60) return 6.0;
      if (percentage >= 50) return 5.0;
      if (percentage >= 40) return 4.0;
      if (percentage >= 30) return 3.0;
      if (percentage >= 20) return 2.0;
      return 1.0;
    };

    const listeningBand = convertToBandScore(listeningScore);
    const readingBand = convertToBandScore(readingScore);
    const writingBand = convertToBandScore(writingScore);
    const speakingBand = convertToBandScore(speakingScore);

    const overallBand = (listeningBand + readingBand + writingBand + speakingBand) / 4;

    return {
      listening: { percentage: listeningScore, band: listeningBand },
      reading: { percentage: readingScore, band: readingBand },
      writing: { percentage: writingScore, band: writingBand },
      speaking: { percentage: speakingScore, band: speakingBand },
      overall: { band: Math.round(overallBand * 2) / 2 } // Round to nearest 0.5
    };
  };

  // Submit test and calculate results
  const submitTest = () => {
    const results = calculateOverallScore();
    setTestResults(results);
    setIsTestCompleted(true);
    setShowResults(true);
  };

  // Generate feedback based on scores
  const generateFeedback = (skill, score) => {
    const band = score.band;
    const percentage = score.percentage;
    
    if (band >= 8.0) {
      return `Excellent performance in ${skill}! Your score of ${band.toFixed(1)} shows mastery of this skill.`;
    } else if (band >= 7.0) {
      return `Good performance in ${skill}. Your score of ${band.toFixed(1)} indicates strong proficiency.`;
    } else if (band >= 6.0) {
      return `Satisfactory performance in ${skill}. Your score of ${band.toFixed(1)} shows adequate proficiency.`;
    } else if (band >= 5.0) {
      return `Limited performance in ${skill}. Your score of ${band.toFixed(1)} suggests you need more practice.`;
    } else {
      return `Poor performance in ${skill}. Your score of ${band.toFixed(1)} indicates significant improvement needed.`;
    }
  };

  // Skill introductions
  const skillIntroductions = {
    listening: {
      title: "Listening Section",
      description: "The Listening section tests your ability to understand spoken English in various contexts. You will hear recordings of native English speakers and answer questions based on what you hear.",
      duration: "30 minutes",
      tips: [
        "Listen carefully to the audio - you can only hear it once",
        "Read the questions before the audio starts",
        "Pay attention to key words and phrases",
        "Use the time given to review your answers",
        "Don't leave any questions blank - make an educated guess if needed"
      ],
      icon: "🎧"
    },
    speaking: {
      title: "Speaking Section",
      description: "The Speaking section assesses your ability to communicate effectively in English. You will have a conversation with an examiner and discuss various topics.",
      duration: "15 minutes",
      tips: [
        "Speak clearly and at a natural pace",
        "Listen carefully to the examiner's questions",
        "Give detailed answers with examples",
        "Don't worry about making some mistakes - focus on communication",
        "Use a variety of vocabulary and grammar structures"
      ],
      icon: "🗣️"
    },
    reading: {
      title: "Reading Section",
      description: "The Reading section evaluates your ability to understand written English. You will read passages and answer questions to test your comprehension skills.",
      duration: "60 minutes",
      tips: [
        "Read the questions first to know what to look for",
        "Skim the passage to get the main idea",
        "Look for key words in both questions and passages",
        "Manage your time - don't spend too long on one question",
        "Check your answers before moving to the next section"
      ],
      icon: "📖"
    },
    writing: {
      title: "Writing Section",
      description: "The Writing section tests your ability to write clearly and coherently in English. You will complete two writing tasks with different requirements.",
      duration: "60 minutes",
      tips: [
        "Plan your essay before you start writing",
        "Use clear topic sentences and supporting details",
        "Vary your vocabulary and sentence structures",
        "Check your grammar and spelling",
        "Stay within the word limits for each task"
      ],
      icon: "✍️"
    }
  };

  // Load mock test data and generate random questions
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const mockTest = await dataService.fetchMockTest(1); // Load first mock test
        if (mockTest) {
          setSections(mockTest.sections);
          
          // Update time remaining based on loaded sections
          const newTimeRemaining = {};
          mockTest.sections.forEach(section => {
            const minutes = parseInt(section.time.split(' ')[0]);
            newTimeRemaining[section.id] = minutes * 60;
          });
          setTimeRemaining(newTimeRemaining);

          // Generate random questions for each section
          const generatedQuestions = {};
          for (const section of mockTest.sections) {
            console.log(`Loading questions for section: ${section.id}`);
            const sectionQuestions = await dataService.fetchMockTestQuestions(1, section.id);
            console.log(`Questions loaded for ${section.id}:`, sectionQuestions);
            generatedQuestions[section.id] = sectionQuestions || [];
          }
          console.log('Final generated questions:', generatedQuestions);
          setQuestions(generatedQuestions);
        }
      } catch (error) {
        console.error('Error loading mock test data:', error);
      }
    };

    loadTestData();
    
    // Load speech synthesis voices
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };
    
    loadVoices();
    // Some browsers need a delay to load voices
    setTimeout(loadVoices, 1000);
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
    // Check if questions are loaded
    if (!questions || Object.keys(questions).length === 0) {
      alert('Questions are still loading. Please wait a moment and try again.');
      return;
    }
    
    // Check if there are questions for the first section
    const firstSection = sections[0]?.id;
    if (firstSection && (!questions[firstSection] || questions[firstSection].length === 0)) {
      alert('No questions available for the first section. Please try again.');
      return;
    }
    
    setIsTestStarted(true);
    setShowingIntroduction(true);
    // Clear all answers when starting a new test
    setAnswers({});
    // Reset audio state when starting test
    setPlayCount(0);
    setIsPlaying(false);
    setIsLoading(false);
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  const startSection = () => {
    // Check if there are questions for the current section
    const currentQuestions = questions[currentSection];
    if (!currentQuestions || currentQuestions.length === 0) {
      alert(`No questions available for ${currentSection} section. Please try again.`);
      return;
    }
    // Clear answers for the current section to prevent binding issues
    clearSectionAnswers(currentSection);
    setShowingIntroduction(false);
  };

  const handleAnswer = (section, questionId, answer) => {
    console.log(`Setting answer for ${section}, question ${questionId}:`, answer);
    setAnswers((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: answer,
      },
    }));
  };

  const clearSectionAnswers = (section) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: {}
    }));
  };

  const clearCurrentQuestionAnswers = () => {
    if (!questions || !questions[currentSection]) return;
    
    const currentQuestions = questions[currentSection];
    const currentQ = currentQuestions[currentQuestion];
    
    if (currentQ && currentQ.type === 'passage' && currentQ.questions) {
      // For passage-type questions, clear all sub-question answers
      const newAnswers = { ...answers };
      currentQ.questions.forEach((_, subIndex) => {
        const answerKey = `${currentQ.id}-${subIndex}`;
        if (newAnswers[currentSection][answerKey] !== undefined) {
          delete newAnswers[currentSection][answerKey];
        }
      });
      setAnswers(newAnswers);
    } else if (currentQ) {
      // For individual questions, clear the specific question answer
      const newAnswers = { ...answers };
      if (newAnswers[currentSection][currentQ.id] !== undefined) {
        delete newAnswers[currentSection][currentQ.id];
      }
      setAnswers(newAnswers);
    }
  };

  const nextQuestion = () => {
    if (!questions || !questions[currentSection]) return;
    
    const currentQuestions = questions[currentSection];
    if (currentQuestion < currentQuestions.length - 1) {
      // Clear answers for the current question before moving to next
      clearCurrentQuestionAnswers();
      setCurrentQuestion((prev) => prev + 1);
      // Reset audio state for new question
      if (currentSection === 'listening') {
        setPlayCount(0);
        setIsPlaying(false);
        setIsLoading(false);
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
      }
    } else {
      // Move to next section
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex < sections.length - 1) {
        const nextSection = sections[sectionIndex + 1].id;
        setCurrentSection(nextSection);
        setCurrentQuestion(0);
        setShowingIntroduction(true);
        // Clear answers for the new section to prevent binding issues
        clearSectionAnswers(nextSection);
        // Reset audio state for new section
        setPlayCount(0);
        setIsPlaying(false);
        setIsLoading(false);
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
      }
    }
  };

  const prevQuestion = () => {
    if (!questions) return;
    
    if (currentQuestion > 0) {
      // Clear answers for the current question before moving to previous
      clearCurrentQuestionAnswers();
      setCurrentQuestion((prev) => prev - 1);
      // Reset audio state for new question
      if (currentSection === 'listening') {
        setPlayCount(0);
        setIsPlaying(false);
        setIsLoading(false);
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
      }
    } else {
      // Move to previous section
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex > 0) {
        const prevSection = sections[sectionIndex - 1].id;
        setCurrentSection(prevSection);
        setCurrentQuestion(questions[prevSection].length - 1);
        // Clear answers for the new section to prevent binding issues
        clearSectionAnswers(prevSection);
        // Reset audio state for new section
        setPlayCount(0);
        setIsPlaying(false);
        setIsLoading(false);
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
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
      if (questions && questions.speaking && questions.speaking[currentQuestion]) {
        handleAnswer(
          'speaking',
          questions.speaking[currentQuestion].id,
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

  // Audio functions for listening section
  const startListening = () => {
    if (playCount >= MAX_PLAYS) {
      alert(`You can only play the audio ${MAX_PLAYS} times.`);
      return;
    }

    setIsLoading(true);
    const question = questions.listening[currentQuestion];
    const passageText = question.passageText || question.passage || 'No audio content available.';
    
    // Check if we have valid text to speak
    if (!passageText || passageText.trim() === '' || passageText === 'No audio content available.') {
      alert('No audio content available for this question.');
      setIsLoading(false);
      return;
    }

    if ('speechSynthesis' in window) {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }

      console.log('Creating speech utterance with text:', passageText);
      const utterance = new SpeechSynthesisUtterance(passageText);
      utterance.rate = 0.85; // Slightly slower for better comprehension
      utterance.pitch = 1.1; // Slightly higher pitch for clarity
      utterance.volume = 1;
      
      // Try to use a better voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Premium'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setPlayCount((prev) => prev + 1);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        console.error('Error details:', {
          error: event.error,
          message: event.message,
          elapsedTime: event.elapsedTime,
          charIndex: event.charIndex,
          name: event.name
        });
        setIsPlaying(false);
        setIsLoading(false);
        // Don't show alert for common errors, just log them
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          alert('Error playing audio. Please try again.');
        }
      };

      speechRef.current = utterance;
      console.log('Starting speech synthesis...');
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error starting speech synthesis:', error);
        setIsPlaying(false);
        setIsLoading(false);
        alert('Error starting audio playback. Please try again.');
      }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSkillIntroduction = () => {
    const intro = skillIntroductions[currentSection];
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{intro.icon}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {intro.title}
              </h1>
              <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full inline-block font-semibold">
                Duration: {intro.duration}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  What to Expect
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {intro.description}
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tips for Success
                </h2>
                <ul className="space-y-3">
                  {intro.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center pt-6">
                <button
                  onClick={startSection}
                  className="bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors text-lg font-semibold shadow-lg"
                >
                  Start {intro.title}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    console.log('renderQuestion called:', {
      currentSection,
      currentQuestion,
      questions: questions,
      currentSectionQuestions: questions[currentSection],
      questionCount: questions[currentSection]?.length
    });

    if (!questions || !questions[currentSection]) {
      return <div className="text-center py-8">Loading questions...</div>;
    }
    
    const currentQuestions = questions[currentSection];
    const question = currentQuestions[currentQuestion];

    // Add null check for question
    if (!question) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 font-semibold mb-2">Question not found...</div>
          <div className="text-sm text-gray-600">
            Section: {currentSection} | Question Index: {currentQuestion} | Total Questions: {currentQuestions.length}
          </div>
        </div>
      );
    }

    // Debug: Log the question structure
    console.log('Rendering question:', {
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      passage: question.passage,
      passageText: question.passageText
    });

    switch (currentSection) {
      case 'listening':
        return (
          <div className="space-y-6">
            {/* Audio Player Section */}
            <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-teal-800 mb-2">🎧 Audio Player</h3>
                <p className="text-sm text-teal-600">Listen to the passage and answer the question below</p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
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
                
                {/* Play Count Display */}
                <div className="text-sm text-teal-700">
                  Plays remaining: {MAX_PLAYS - playCount} of {MAX_PLAYS}
                </div>
                
                {/* Audio Status */}
                {isPlaying && (
                  <div className="flex items-center gap-2 text-teal-600">
                    <div className="animate-pulse">🔊</div>
                    <span className="text-sm font-medium">Playing audio...</span>
                  </div>
                )}
                
                {!isPlaying && playCount > 0 && (
                  <div className="text-sm text-gray-600">
                    Audio ready to play again
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">{question.passageTitle || question.question || 'Passage not available'}</h4>
              
              {/* Render all questions for this passage */}
              {question.type === 'passage' && question.questions && (
                <div className="space-y-6">
                  {question.questions.map((subQuestion, subIndex) => (
                    <div key={`${question.id}-${subIndex}`} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-3">
                        Question {subIndex + 1}: {subQuestion.question}
                      </h5>
                      
                      {subQuestion.options ? (
                        <div className="space-y-2">
                          {subQuestion.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`listening-${question.id}-${subIndex}`}
                                value={optionIndex}
                                checked={answers.listening[`${question.id}-${subIndex}`] === optionIndex}
                                onChange={(e) =>
                                  handleAnswer(
                                    'listening',
                                    `${question.id}-${subIndex}`,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="text-teal-600"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : subQuestion.type === 'completion' || subQuestion.type === 'shortAnswer' ? (
                        <input
                          type="text"
                          value={answers.listening[`${question.id}-${subIndex}`] || ''}
                          onChange={(e) =>
                            handleAnswer('listening', `${question.id}-${subIndex}`, e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          placeholder="Type your answer here..."
                        />
                      ) : subQuestion.type === 'true_false' ? (
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`listening-${question.id}-${subIndex}`}
                              value="true"
                              checked={answers.listening[`${question.id}-${subIndex}`] === true}
                              onChange={() =>
                                handleAnswer('listening', `${question.id}-${subIndex}`, true)
                              }
                              className="text-teal-600"
                            />
                            <span>True</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`listening-${question.id}-${subIndex}`}
                              value="false"
                              checked={answers.listening[`${question.id}-${subIndex}`] === false}
                              onChange={() =>
                                handleAnswer('listening', `${question.id}-${subIndex}`, false)
                              }
                              className="text-teal-600"
                            />
                            <span>False</span>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback for individual questions (if not passage type) */}
              {question.type !== 'passage' && (
                <>
                  {question.type === 'multiple-choice' && question.options && (
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
                </>
              )}
            </div>
          </div>
        );

      case 'speaking':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Speaking Part {question.part || 'Unknown'}
              </h3>
              <h4 className="text-lg font-medium mb-4">{question.title || 'Speaking Question'}</h4>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Question:</h5>
                  <p className="whitespace-pre-line">{question.question || 'Question not available'}</p>
                </div>

                {question.part === 2 && question.preparationTime && (
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
                Reading Passage {currentQuestion + 1}
              </h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Passage:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {question.passageText || question.passage || 'Passage not available'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">{question.passageTitle || question.question || 'Passage not available'}</h4>
                  
                  {/* Render all questions for this passage */}
                  {question.type === 'passage' && question.questions && (
                    <div className="space-y-6">
                      {question.questions.map((subQuestion, subIndex) => (
                        <div key={`${question.id}-${subIndex}`} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-gray-800 mb-3">
                            Question {subIndex + 1}: {subQuestion.text || subQuestion.question}
                          </h5>
                          
                          {subQuestion.options ? (
                            <div className="space-y-2">
                              {subQuestion.options.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex items-center space-x-3 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`reading-${question.id}-${subIndex}`}
                                    value={optionIndex}
                                    checked={answers.reading[`${question.id}-${subIndex}`] === optionIndex}
                                    onChange={(e) =>
                                      handleAnswer(
                                        'reading',
                                        `${question.id}-${subIndex}`,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="text-teal-600"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          ) : subQuestion.type === 'completion' || subQuestion.type === 'shortAnswer' ? (
                            <input
                              type="text"
                              value={answers.reading[`${question.id}-${subIndex}`] || ''}
                              onChange={(e) =>
                                handleAnswer('reading', `${question.id}-${subIndex}`, e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Type your answer here..."
                            />
                          ) : subQuestion.type === 'true_false' || subQuestion.type === 'true-false' ? (
                            <div className="space-y-2">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`reading-${question.id}-${subIndex}`}
                                  value="true"
                                  checked={answers.reading[`${question.id}-${subIndex}`] === true}
                                  onChange={() =>
                                    handleAnswer('reading', `${question.id}-${subIndex}`, true)
                                  }
                                  className="text-teal-600"
                                />
                                <span>True</span>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`reading-${question.id}-${subIndex}`}
                                  value="false"
                                  checked={answers.reading[`${question.id}-${subIndex}`] === false}
                                  onChange={() =>
                                    handleAnswer('reading', `${question.id}-${subIndex}`, false)
                                  }
                                  className="text-teal-600"
                                />
                                <span>False</span>
                              </label>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback for individual questions (if not passage type) */}
                  {question.type !== 'passage' && (
                    <>
                      {question.type === 'multiple-choice' && question.options && (
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


                    </>
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
                        Write a formal or informal letter based on the situation described above. 
                        Remember to include appropriate greetings, body paragraphs, and closing.
                        <strong>Time: 20 minutes | Words: 150-200</strong>
                      </p>
                    </div>
                  )}
                  
                  {question.type === 'task2' && (
                    <div className="mt-4 p-3 bg-green-50 rounded">
                      <h6 className="font-medium text-green-800 mb-2">Task 2: Essay Writing</h6>
                      <p className="text-sm text-green-700">
                        Write an essay responding to the given topic. Include an introduction, 
                        body paragraphs with supporting arguments, and a conclusion.
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
              disabled={!questions || Object.keys(questions).length === 0}
              className={`px-8 py-4 rounded-lg transition-colors text-lg font-semibold ${
                !questions || Object.keys(questions).length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {!questions || Object.keys(questions).length === 0 
                ? 'Loading Questions...' 
                : 'Start Mock Test'
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show skill introduction if needed
  if (showingIntroduction) {
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
        {renderSkillIntroduction()}
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
              {currentQuestion + 1} of {questions[currentSection]?.length || 0}
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-medium">
              {formatTime(timeRemaining[currentSection])}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {showResults ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🎉 Test Results
                </h2>
                <p className="text-gray-600">
                  Here's how you performed in each section
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 mb-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Overall Band Score</h3>
                <div className="text-5xl font-bold mb-2">
                  {testResults?.overall.band.toFixed(1)}
                </div>
                <p className="text-teal-100">
                  {testResults?.overall.band >= 7.0 ? 'Excellent!' : 
                   testResults?.overall.band >= 6.0 ? 'Good!' : 
                   testResults?.overall.band >= 5.0 ? 'Satisfactory' : 'Needs Improvement'}
                </p>
              </div>

              {/* Individual Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Listening */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                      🎧 Listening
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">
                        {testResults?.listening.band.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testResults?.listening.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {generateFeedback('Listening', testResults?.listening)}
                  </p>
                </div>

                {/* Reading */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                      📖 Reading
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">
                        {testResults?.reading.band.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testResults?.reading.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {generateFeedback('Reading', testResults?.reading)}
                  </p>
                </div>

                {/* Writing */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                      ✍️ Writing
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">
                        {testResults?.writing.band.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testResults?.writing.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {generateFeedback('Writing', testResults?.writing)}
                  </p>
                </div>

                {/* Speaking */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                      🗣️ Speaking
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">
                        {testResults?.speaking.band.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testResults?.speaking.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {generateFeedback('Speaking', testResults?.speaking)}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  📋 Recommendations
                </h4>
                <div className="space-y-3">
                  {testResults?.listening.band < 6.0 && (
                    <p className="text-gray-700">
                      • <strong>Listening:</strong> Practice with audio materials, focus on note-taking skills
                    </p>
                  )}
                  {testResults?.reading.band < 6.0 && (
                    <p className="text-gray-700">
                      • <strong>Reading:</strong> Improve skimming and scanning techniques, expand vocabulary
                    </p>
                  )}
                  {testResults?.writing.band < 6.0 && (
                    <p className="text-gray-700">
                      • <strong>Writing:</strong> Practice essay structure, work on grammar and coherence
                    </p>
                  )}
                  {testResults?.speaking.band < 6.0 && (
                    <p className="text-gray-700">
                      • <strong>Speaking:</strong> Practice fluency, work on pronunciation and vocabulary
                    </p>
                  )}
                  {testResults?.overall.band >= 6.0 && (
                    <p className="text-green-700 font-semibold">
                      • Great job! Consider taking more practice tests to maintain your performance.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 font-semibold text-center"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setIsTestCompleted(false);
                    setTestResults(null);
                    setAnswers({
                      listening: {},
                      speaking: {},
                      reading: {},
                      writing: {},
                    });
                    setCurrentSection('listening');
                    setCurrentQuestion(0);
                    setIsTestStarted(false);
                    setShowingIntroduction(true);
                  }}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Take Another Test
                </button>
              </div>
            </div>
          ) : (
            <>
              {renderQuestion()}

              <div className="flex justify-between mt-8">
            <button
              onClick={prevQuestion}
              disabled={
                !questions ||
                currentQuestion === 0 &&
                sections.findIndex((s) => s.id === currentSection) === 0
              }
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestion === questions[currentSection]?.length - 1 &&
             sections.findIndex((s) => s.id === currentSection) === sections.length - 1 ? (
              <button
                onClick={submitTest}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={
                  !questions ||
                  currentQuestion === questions[currentSection]?.length - 1 &&
                  sections.findIndex((s) => s.id === currentSection) === sections.length - 1
                }
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTest;
