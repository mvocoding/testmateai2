import React, { useState, useRef, useEffect } from 'react';
import dataService from '../services/dataService';
 
import ListeningQuestionBlock from './mocktest/ListeningQuestionBlock';
import ReadingQuestionBlock from './mocktest/ReadingQuestionBlock';
import WritingQuestionBlock from './mocktest/WritingQuestionBlock';
import SpeakingQuestionBlock from './mocktest/SpeakingQuestionBlock';
import StartScreen from './mocktest/StartScreen';
import SectionIntro from './mocktest/SectionIntro';
import TestHeader from './mocktest/TestHeader';
import ResultsView from './mocktest/ResultsView';
import skillIntroductions from './mocktest/skillIntroductions';
import submitMockTest from './mocktest/submitTest';
import { cancelSpeech, getPreferredVoice } from './mocktest/audioHelpers';
import { formatTime } from './mocktest/format';

 

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
    listening: 30 * 60,
    speaking: 15 * 60,
    reading: 60 * 60,
    writing: 60 * 60,
  });
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showingIntroduction, setShowingIntroduction] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionRef] = useState(useRef(null));
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState({
    listening: [],
    speaking: [],
    reading: [],
    writing: [],
  });

  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [speechRef] = useState(useRef(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [totalSubmitTasks, setTotalSubmitTasks] = useState(0);
  const [aiFeedback, setAiFeedback] = useState({
    listening: [],
    reading: [],
    speaking: [],
    writing: [],
  });
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('listening');

  const resetListening = () => {
    setPlayCount(0);
    setIsPlaying(false);
    setIsLoading(false);
    cancelSpeech();
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    setSubmitProgress(0);

    const listeningPassages = Array.isArray(questions.listening) ? questions.listening : [];
    const readingPassages = Array.isArray(questions.reading) ? questions.reading : [];
    const speakingItems = Array.isArray(questions.speaking) ? questions.speaking : [];
    const writingItems = Array.isArray(questions.writing) ? questions.writing : [];

    const total =
      listeningPassages.filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0).length +
      readingPassages.filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0).length +
      speakingItems.length +
      writingItems.length;
    setTotalSubmitTasks(total);

    try {
      const { aiFeedback: fb, results } = await submitMockTest({
        questions,
        answers,
        onProgress: () => setSubmitProgress((prev) => prev + 1),
      });

      setAiFeedback(fb);
      setTestResults(results);
      setIsTestCompleted(true);
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const availableTests = await dataService.getMockTests(1);
        const selectedTest =
          Array.isArray(availableTests) && availableTests.length > 0
            ? availableTests[0]
            : null;

        if (selectedTest && Array.isArray(selectedTest.sections)) {
          setSections(selectedTest.sections);

          const newTimeRemaining = {};
          selectedTest.sections.forEach((section) => {
            const minutes = parseInt(section.time.split(' ')[0]);
            newTimeRemaining[section.id] = minutes * 60;
          });
          setTimeRemaining(newTimeRemaining);

          const generatedQuestions = {};
          for (const section of selectedTest.sections) {
            const sectionQuestions = await dataService.fetchMockTestQuestions(
              selectedTest.id,
              section.id,
              Number(section.questions) || undefined
            );
            generatedQuestions[section.id] = sectionQuestions || [];
          }
          setQuestions(generatedQuestions);
        }
      } catch (error) {}
    };

    loadTestData();

    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };

    loadVoices();
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
    if (!questions || Object.keys(questions).length === 0) {
      alert('Questions are still loading. Please wait a moment and try again.');
      return;
    }

    const firstSection = sections[0]?.id;
    if (
      firstSection &&
      (!questions[firstSection] || questions[firstSection].length === 0)
    ) {
      alert('No questions available for the first section. Please try again.');
      return;
    }

    setIsTestStarted(true);
    setShowingIntroduction(true);
    setAnswers({});
    resetListening();
  };

  const startSection = () => {
    const currentQuestions = questions[currentSection];
    if (!currentQuestions || currentQuestions.length === 0) {
      alert(
        `No questions available for ${currentSection} section. Please try again.`
      );
      return;
    }
    clearSectionAnswers(currentSection);
    setShowingIntroduction(false);
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

  const clearSectionAnswers = (section) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: {},
    }));
  };

  const clearCurrentQuestionAnswers = () => {
    if (!questions || !questions[currentSection]) return;

    const currentQuestions = questions[currentSection];
    const currentQ = currentQuestions[currentQuestion];

    if (currentQ && currentQ.type === 'passage' && currentQ.questions) {
      const newAnswers = { ...answers };
      currentQ.questions.forEach((_, subIndex) => {
        const answerKey = `${currentQ.id}-${subIndex}`;
        if (newAnswers[currentSection][answerKey] !== undefined) {
          delete newAnswers[currentSection][answerKey];
        }
      });
      setAnswers(newAnswers);
    } else if (currentQ) {
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
      clearCurrentQuestionAnswers();
      setCurrentQuestion((prev) => prev + 1);
      if (currentSection === 'listening') {
        resetListening();
      }
    } else {
      // Move to next section
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex < sections.length - 1) {
        const nextSection = sections[sectionIndex + 1].id;
        setCurrentSection(nextSection);
        setCurrentQuestion(0);
        setShowingIntroduction(true);
        clearSectionAnswers(nextSection);
        resetListening();
      }
    }
  };

  const prevQuestion = () => {
    if (!questions) return;

    if (currentQuestion > 0) {
      clearCurrentQuestionAnswers();
      setCurrentQuestion((prev) => prev - 1);
      if (currentSection === 'listening') {
        resetListening();
      }
    } else {
      const sectionIndex = sections.findIndex((s) => s.id === currentSection);
      if (sectionIndex > 0) {
        const prevSection = sections[sectionIndex - 1].id;
        setCurrentSection(prevSection);
        setCurrentQuestion(questions[prevSection].length - 1);
        clearSectionAnswers(prevSection);
        resetListening();
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
      if (
        questions &&
        questions.speaking &&
        questions.speaking[currentQuestion]
      ) {
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

  const startListening = () => {
    setIsLoading(true);
    const question = questions.listening[currentQuestion];
    const passageText =
      question.passageText || question.passage || 'No audio content available.';

    if (
      !passageText ||
      passageText.trim() === '' ||
      passageText === 'No audio content available.'
    ) {
      alert('No audio content available for this question.');
      setIsLoading(false);
      return;
    }

    if ('speechSynthesis' in window) {
      cancelSpeech();

      const utterance = new SpeechSynthesisUtterance(passageText);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = getPreferredVoice(voices);
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

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      speechRef.current = utterance;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
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
      cancelSpeech();
      setIsPlaying(false);
    }
  };

  

  const renderQuestion = () => {
    if (!questions || !questions[currentSection]) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    const currentQuestions = questions[currentSection];
    const question = currentQuestions[currentQuestion];

    if (!question) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 font-semibold mb-2">
            Question not found...
          </div>
          <div className="text-sm text-gray-600">
            Section: {currentSection} | Question Index: {currentQuestion} |
            Total Questions: {currentQuestions.length}
          </div>
        </div>
      );
    }

    switch (currentSection) {
      case 'listening':
        return (
          <ListeningQuestionBlock
            question={question}
            answersSection={answers.listening}
            onAnswer={(id, val) => handleAnswer('listening', id, val)}
            startListening={startListening}
            stopListening={stopListening}
            isPlaying={isPlaying}
            isLoading={isLoading}
            playCount={playCount}
          />
        );

      case 'speaking':
        return (
          <SpeakingQuestionBlock
            question={question}
            answersSection={answers.speaking}
            isRecording={isRecording}
            startRecording={startSpeakingRecording}
            stopRecording={stopSpeakingRecording}
          />
        );

      case 'reading':
        return (
          <ReadingQuestionBlock
            question={{ ...question, index: currentQuestion }}
            answersSection={answers.reading}
            onAnswer={(id, val) => handleAnswer('reading', id, val)}
          />
        );

      case 'writing':
        return (
          <WritingQuestionBlock
            question={question}
            answersSection={answers.writing}
            onAnswer={(id, val) => handleAnswer('writing', id, val)}
            formatTime={formatTime}
          />
        );

      default:
        return null;
    }
  };

  if (!isTestStarted) {
    return (
      <StartScreen
        sections={sections}
        questions={questions}
        onStart={startTest}
      />
    );
  }

  if (showingIntroduction) {
    return (
      <SectionIntro
        intro={skillIntroductions[currentSection]}
        onStart={startSection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TestHeader
        currentSectionName={sections.find((s) => s.id === currentSection)?.name}
        currentQuestionIndex={currentQuestion + 1}
        totalQuestions={questions[currentSection]?.length || 0}
        timeText={formatTime(timeRemaining[currentSection])}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {showResults ? (
            <ResultsView
              testResults={testResults}
              aiFeedback={aiFeedback}
              activeTab={activeAnalysisTab}
              onChangeTab={(tab) => setActiveAnalysisTab(tab)}
              onRetake={() => {
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
            />
          ) : (
            <>
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                  <p className="text-gray-700 font-medium mb-2">
                    Analyzing your answers...
                  </p>
                  <p className="text-sm text-gray-500">
                    {submitProgress}/{totalSubmitTasks} tasks completed
                  </p>
                </div>
              ) : (
                renderQuestion()
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevQuestion}
                  disabled={
                    !questions ||
                    (currentQuestion === 0 &&
                      sections.findIndex((s) => s.id === currentSection) === 0)
                  }
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {!isSubmitting &&
                currentQuestion === questions[currentSection]?.length - 1 &&
                sections.findIndex((s) => s.id === currentSection) ===
                  sections.length - 1 ? (
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
                      (currentQuestion ===
                        questions[currentSection]?.length - 1 &&
                        sections.findIndex((s) => s.id === currentSection) ===
                          sections.length - 1)
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
