import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/dataService';
import {
  generateListeningFeedback,
  saveVocabularyWords,
  recordPracticeActivity,
} from '../utils';
import QuestionsForm from './listening/QuestionsForm';
import ResultsPanel from './listening/ResultsPanel';
import PassageSidebar from './listening/PassageSidebar';
import AudioPlayer from './listening/AudioPlayer';
import PassageHeader from './listening/PassageHeader';

const TIME_LIMIT = 300;
const DEFAULT_TAB = 'transcription';

const Listening = () => {
  const [selectedQuestionType, setSelectedQuestionType] =
    useState('multipleChoice');
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [listeningData, setListeningData] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const speechRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadListeningData = async () => {
      try {
        const data = await dataService.getPracticeQuestions('listening');
        setListeningData(data);
      } catch (error) {}
    };

    loadListeningData();

    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };

    loadVoices();
    setTimeout(loadVoices, 1000);
  }, []);

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      setIsTimerActive(false);
      clearTimeout(timerRef.current);
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResults(true);
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

  const LISTENING_LEVELS = listeningData?.passages || [];
  const currentPassages = LISTENING_LEVELS.filter(
    (passage) => passage.questionType === selectedQuestionType
  );

  const resetPassageState = () => {
    setAnswers({});
    setShowResults(false);
    setAiFeedback(null);
    setActiveTab(DEFAULT_TAB);
    setPlayCount(0);
    setTimeRemaining(0);
    setIsTimerActive(false);
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSelectQuestionType = (type) => {
    setSelectedQuestionType(type);
    setCurrentPassageIndex(0);
    resetPassageState();
  };

  const handleSelectPassage = (idx) => {
    setCurrentPassageIndex(idx);
    resetPassageState();
  };

  const startListening = () => {
    setIsLoading(true);
    const passage = currentPassages[currentPassageIndex];

    if (!passage || !passage.text) {
      alert('No audio text available for this passage.');
      setIsLoading(false);
      return;
    }

    if ('speechSynthesis' in window) {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(passage.text);

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.lang.includes('en') &&
          (voice.name.includes('Google') ||
            voice.name.includes('Natural') ||
            voice.name.includes('Premium'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

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
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      };
      return newAnswers;
    });
  };

  const calculateScore = () => {
    const passage = currentPassages[currentPassageIndex];
    if (!passage || !passage.questions) return 0;

    let correct = 0;
    let total = passage.questions.length;

    passage.questions.forEach((question) => {
      const userAnswer = answers[question.id];

      if (question.options) {
        if (userAnswer === question.correct) correct++;
      } else if (question.type === 'fill_blank') {
        if (
          userAnswer &&
          userAnswer.toLowerCase().trim() ===
            (question.answer || question.correct).toLowerCase().trim()
        ) {
          correct++;
        }
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct) correct++;
      }
    });

    return Math.round((correct / total) * 9);
  };

  const handleSubmit = async () => {
    setIsTimerActive(false);
    clearTimeout(timerRef.current);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    setIsAnalyzing(true);
    try {
      const formattedAnswers = {};
      questions.forEach((question, idx) => {
        const userAnswer = answers[question.id];

        if (
          question.options &&
          userAnswer !== undefined &&
          userAnswer !== null
        ) {
          formattedAnswers[question.id] = question.options[userAnswer];
        } else {
          formattedAnswers[question.id] = userAnswer;
        }
      });

      const feedback = await generateListeningFeedback(
        passage,
        questions,
        formattedAnswers
      );

      const correctedFeedback = {
        ...feedback,
        question_analysis:
          feedback.question_analysis?.map((analysis, idx) => {
            const question = questions[idx];
            const userAnswer = answers[question.id];

            // Get actual answer text
            let actualCorrectAnswer, actualStudentAnswer;
            if (question.options) {
              actualCorrectAnswer = question.options
                ? question.options[question.correct]
                : question.correct;
              actualStudentAnswer =
                question.options &&
                userAnswer !== undefined &&
                userAnswer !== null
                  ? question.options[userAnswer]
                  : 'No answer provided';
            } else {
              actualCorrectAnswer = question.answer || question.correct;
              actualStudentAnswer = userAnswer || 'No answer provided';
            }

            let isActuallyCorrect = false;
            if (question.options) {
              isActuallyCorrect = userAnswer === question.correct;
            } else if (question.type === 'fill_blank') {
              const userAnswerText = (userAnswer || '')
                .toString()
                .toLowerCase()
                .trim();
              const correctAnswer = (question.answer || question.correct)
                .toString()
                .toLowerCase()
                .trim();
              isActuallyCorrect = userAnswerText === correctAnswer;
            } else if (question.type === 'true_false') {
              isActuallyCorrect = userAnswer === question.correct;
            }

            const correctedAnalysis = {
              ...analysis,
              correct_answer: actualCorrectAnswer,
              student_answer: actualStudentAnswer,
              is_correct: isActuallyCorrect,
            };
            return correctedAnalysis;
          }) || [],
      };

      setAiFeedback(correctedFeedback);

      if (
        feedback.vocabulary_notes &&
        Array.isArray(feedback.vocabulary_notes)
      ) {
        const words = feedback.vocabulary_notes
          .map((note) => (typeof note === 'string' ? note : note.word || ''))
          .filter((word) => word);
        if (words.length > 0) {
          await saveVocabularyWords(words);
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
        }
      }

      const score = feedback.overall_score || 6.0;
      const band = Math.round(score * 2) / 2;
      await recordPracticeActivity('listening', score, band, {
        passage: passage.title,
        questionsAnswered: Object.keys(answers).length,
        totalQuestions: questions.length,
        feedback: feedback.overall_feedback,
      });
    } catch (error) {
      setAiFeedback(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextPassage = () => {
    if (currentPassageIndex < currentPassages.length - 1) {
      setCurrentPassageIndex((prev) => prev + 1);
      resetPassageState();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const passage = currentPassages[currentPassageIndex];
  const questions = passage?.questions || [];

  if (!passage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">
            Passage not found
          </div>
          <p className="text-gray-600">
            Please try selecting a different passage.
          </p>
        </div>
      </div>
    );
  }

  if (currentPassages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">
            No passages available for this question type
          </div>
          <p className="text-gray-600">
            Please select a different question type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4 ">
            <h1 className="text-3xl font-bold text-teal-700 mb-2 ">
              Listening Test
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap ">
            {listeningData?.questionTypes?.map((type, index) => (
              <button
                key={type.type}
                onClick={() => handleSelectQuestionType(type.type)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  selectedQuestionType === type.type
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{type.name}</div>
                </div>
              </button>
            )) || (
              <div className="col-span-4 text-center text-gray-600">
                Loading question types...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
          <PassageHeader
            title={passage.title}
            heading={
              listeningData?.questionTypes?.find(
                (t) => t.type === selectedQuestionType
              )?.name || 'Listening Practice'
            }
          />
          <AudioPlayer
            isPlaying={isPlaying}
            isLoading={isLoading}
            playCount={playCount}
            isTimerActive={isTimerActive}
            timeRemaining={timeRemaining}
            onStart={startListening}
            onStop={stopListening}
            formatTime={formatTime}
          />
          {!showResults ? (
            <QuestionsForm
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <ResultsPanel
              score={score}
              currentPassageIndex={currentPassageIndex}
              totalPassages={currentPassages.length}
              isAnalyzing={isAnalyzing}
              aiFeedback={aiFeedback}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onNextPassage={handleNextPassage}
            />
          )}
        </div>
        <PassageSidebar
          passages={currentPassages}
          currentIndex={currentPassageIndex}
          onSelect={handleSelectPassage}
        />
      </div>
    </div>
  );
};

export default Listening;
