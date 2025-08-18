import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dataService from '../services/dataService';
import { generateSpeakingFeedback, generateWritingFeedback, generateListeningFeedback, generateReadingFeedback } from '../utils';
import ListeningQuestionBlock from './mocktest/ListeningQuestionBlock';
import ReadingQuestionBlock from './mocktest/ReadingQuestionBlock';
import WritingQuestionBlock from './mocktest/WritingQuestionBlock';
import SpeakingQuestionBlock from './mocktest/SpeakingQuestionBlock';
import StartScreen from './mocktest/StartScreen';
import SectionIntro from './mocktest/SectionIntro';
import TestHeader from './mocktest/TestHeader';
import ResultsView from './mocktest/ResultsView';

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
    writing: []
  });
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('listening');
  
  const cancelSpeech = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  const resetListening = () => {
    setPlayCount(0);
    setIsPlaying(false);
    setIsLoading(false);
    cancelSpeech();
  };

  const getPreferredVoice = (voices) =>
    voices.find(
      (voice) =>
        voice.lang.includes('en') &&
        (voice.name.includes('Google') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Premium'))
    );

  const submitTest = async () => {
    setIsSubmitting(true);
    setSubmitProgress(0);
    let listeningBand = 0;
    let readingBand = 0;
    let listeningPercentage = 0;
    let readingPercentage = 0;
    let speakingBand = 0;
    let writingBand = 0;

    try {
      const listeningPassages = Array.isArray(questions.listening) ? questions.listening : [];
      const readingPassages = Array.isArray(questions.reading) ? questions.reading : [];
      const speakingItems = Array.isArray(questions.speaking) ? questions.speaking : [];
      const writingItems = Array.isArray(questions.writing) ? questions.writing : [];

      const listeningTasks = listeningPassages
        .filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0)
        .map((p) => {
          const userAnswersById = {};
          p.questions.forEach((q, idx) => {
            const key = `${p.id}-${idx}`;
            const val = answers.listening?.[key];
            if (val !== undefined) {
              if (Array.isArray(q.options) && q.options.length > 0 && typeof val === 'number') {
                userAnswersById[q.id] = q.options[val];
              } else {
                userAnswersById[q.id] = val;
              }
            }
          });
          const passageMeta = { text: p.passage || p.passageText || '', title: p.passageTitle || p.title || '' };
          const normalizedQs = p.questions.map((q) => ({
            ...q,
            question: q.question || q.text || '',
          }));
          return generateListeningFeedback(passageMeta, normalizedQs, userAnswersById);
        });

      const readingTasks = readingPassages
        .filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0)
        .map((p) => {
          const userAnswersByIndex = p.questions.map((q, idx) => {
            const key = `${p.id}-${idx}`;
            return answers.reading?.[key];
          });
          const passageMeta = { text: p.passage || p.passageText || '', title: p.passageTitle || p.title || '' };
          const normalizedQs = p.questions.map((q) => ({
            ...q,
            text: q.text || q.question || '',
            question: q.question || q.text || '',
          }));
          return generateReadingFeedback(passageMeta, normalizedQs, userAnswersByIndex);
        });

      const speakingTasks = speakingItems.map((q) => {
        const transcript = (answers.speaking?.[q.id] || '').toString();
        return generateSpeakingFeedback(q.question || '', transcript);
      });

      const writingTasks = writingItems.map((q) => {
        const essay = (answers.writing?.[q.id] || '').toString();
        const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
        return generateWritingFeedback(q.question || q.title || '', essay, wordCount);
      });

      const total = listeningTasks.length + readingTasks.length + speakingTasks.length + writingTasks.length;
      setTotalSubmitTasks(total);

      const increment = () => setSubmitProgress((prev) => prev + 1);
      const track = (p) => p.then((res) => { increment(); return res; }).catch(() => { increment(); return null; });

      const [listeningFbs, readingFbs, speakingFbs, writingFbs] = await Promise.all([
        Promise.all(listeningTasks.map(track)),
        Promise.all(readingTasks.map(track)),
        Promise.all(speakingTasks.map(track)),
        Promise.all(writingTasks.map(track))
      ]);

      setAiFeedback({
        listening: (listeningFbs || []).filter(Boolean),
        reading: (readingFbs || []).filter(Boolean),
        speaking: (speakingFbs || []).filter(Boolean),
        writing: (writingFbs || []).filter(Boolean)
      });

      const listeningBands = [];
      const listeningPercents = [];
      (listeningFbs || []).forEach((fb) => {
        if (!fb) return;
        const bandVal = typeof fb?.overall_score === 'number' ? fb.overall_score : Number(fb?.overall_score) || 0;
        if (!isNaN(bandVal) && bandVal > 0) listeningBands.push(bandVal);
        if (Array.isArray(fb?.question_analysis)) {
          const totalQ = fb.question_analysis.length;
          const correct = fb.question_analysis.filter((qa) => qa.is_correct).length;
          listeningPercents.push(totalQ > 0 ? (correct / totalQ) * 100 : 0);
        }
      });
      listeningBand = listeningBands.length > 0 ? listeningBands.reduce((a, b) => a + b, 0) / listeningBands.length : 0;
      listeningPercentage = listeningPercents.length > 0 ? listeningPercents.reduce((a, b) => a + b, 0) / listeningPercents.length : 0;

      const readingBands = [];
      const readingPercents = [];
      (readingFbs || []).forEach((fb) => {
        if (!fb) return;
        const bandVal = typeof fb?.overall_score === 'number' ? fb.overall_score : Number(fb?.overall_score) || 0;
        if (!isNaN(bandVal) && bandVal > 0) readingBands.push(bandVal);
        if (Array.isArray(fb?.question_analysis)) {
          const totalQ = fb.question_analysis.length;
          const correct = fb.question_analysis.filter((qa) => qa.is_correct).length;
          readingPercents.push(totalQ > 0 ? (correct / totalQ) * 100 : 0);
        }
      });
      readingBand = readingBands.length > 0 ? readingBands.reduce((a, b) => a + b, 0) / readingBands.length : 0;
      readingPercentage = readingPercents.length > 0 ? readingPercents.reduce((a, b) => a + b, 0) / readingPercents.length : 0;

      const speakingBands = [];
      (speakingFbs || []).forEach((fb) => {
        if (!fb) return;
        const bandVal = typeof fb?.band === 'number' ? fb.band : Number(fb?.band) || 0;
        if (!isNaN(bandVal) && bandVal > 0) speakingBands.push(bandVal);
      });
      const writingBands = [];
      (writingFbs || []).forEach((fb) => {
        if (!fb) return;
        const bandVal = typeof fb?.overall_score === 'number' ? fb.overall_score : (typeof fb?.band === 'number' ? fb.band : Number(fb?.band) || 0);
        if (!isNaN(bandVal) && bandVal > 0) writingBands.push(bandVal);
      });

      speakingBand = speakingBands.length > 0 ? speakingBands.reduce((a, b) => a + b, 0) / speakingBands.length : 0;
      writingBand = writingBands.length > 0 ? writingBands.reduce((a, b) => a + b, 0) / writingBands.length : 0;
    } catch (e) {}

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const derivedPercentageFromBand = (band) => clamp(band * 10, 0, 100);

    const results = {
      listening: { percentage: listeningPercentage || derivedPercentageFromBand(listeningBand), band: listeningBand || 1.0 },
      reading: { percentage: readingPercentage || derivedPercentageFromBand(readingBand), band: readingBand || 1.0 },
      writing: {
        percentage: derivedPercentageFromBand(writingBand),
        band: writingBand || 1.0,
      },
      speaking: {
        percentage: derivedPercentageFromBand(speakingBand),
        band: speakingBand || 1.0,
      },
      overall: {
        band: Math.round(((listeningBand + readingBand + (writingBand || 1.0) + (speakingBand || 1.0)) / 4) * 2) / 2,
      },
    };

    try {
    setTestResults(results);
    setIsTestCompleted(true);
    setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFeedback = (skill, score) => {
    const band = score.band;

    if (band >= 8.0) {
      return `Excellent performance in ${skill}! Your score of ${band.toFixed(
        1
      )} shows mastery of this skill.`;
    } else if (band >= 7.0) {
      return `Good performance in ${skill}. Your score of ${band.toFixed(
        1
      )} indicates strong proficiency.`;
    } else if (band >= 6.0) {
      return `Satisfactory performance in ${skill}. Your score of ${band.toFixed(
        1
      )} shows adequate proficiency.`;
    } else if (band >= 5.0) {
      return `Limited performance in ${skill}. Your score of ${band.toFixed(
        1
      )} suggests you need more practice.`;
    } else {
      return `Poor performance in ${skill}. Your score of ${band.toFixed(
        1
      )} indicates significant improvement needed.`;
    }
  };

  const skillIntroductions = {
    listening: {
      title: 'Listening Section',
      description:
        'The Listening section tests your ability to understand spoken English in various contexts. You will hear recordings of native English speakers and answer questions based on what you hear.',
      duration: '30 minutes',
      tips: [
        'Listen carefully to the audio - you can only hear it once',
        'Read the questions before the audio starts',
        'Pay attention to key words and phrases',
        'Use the time given to review your answers',
        "Don't leave any questions blank - make an educated guess if needed",
      ],
      icon: '🎧',
    },
    speaking: {
      title: 'Speaking Section',
      description:
        'The Speaking section assesses your ability to communicate effectively in English. You will have a conversation with an examiner and discuss various topics.',
      duration: '15 minutes',
      tips: [
        'Speak clearly and at a natural pace',
        "Listen carefully to the examiner's questions",
        'Give detailed answers with examples',
        "Don't worry about making some mistakes - focus on communication",
        'Use a variety of vocabulary and grammar structures',
      ],
      icon: '🗣️',
    },
    reading: {
      title: 'Reading Section',
      description:
        'The Reading section evaluates your ability to understand written English. You will read passages and answer questions to test your comprehension skills.',
      duration: '60 minutes',
      tips: [
        'Read the questions first to know what to look for',
        'Skim the passage to get the main idea',
        'Look for key words in both questions and passages',
        "Manage your time - don't spend too long on one question",
        'Check your answers before moving to the next section',
      ],
      icon: '📖',
    },
    writing: {
      title: 'Writing Section',
      description:
        'The Writing section tests your ability to write clearly and coherently in English. You will complete two writing tasks with different requirements.',
      duration: '60 minutes',
      tips: [
        'Plan your essay before you start writing',
        'Use clear topic sentences and supporting details',
        'Vary your vocabulary and sentence structures',
        'Check your grammar and spelling',
        'Stay within the word limits for each task',
      ],
      icon: '✍️',
    },
  };

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const availableTests = await dataService.getMockTests(1);
        const selectedTest = Array.isArray(availableTests) && availableTests.length > 0
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <StartScreen sections={sections} questions={questions} onStart={startTest} />
    );
  }

  if (showingIntroduction) {
    return (
      <SectionIntro intro={skillIntroductions[currentSection]} onStart={startSection} />
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
                setAnswers({ listening: {}, speaking: {}, reading: {}, writing: {} });
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
                  <p className="text-gray-700 font-medium mb-2">Analyzing your answers...</p>
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

                {!isSubmitting && currentQuestion === questions[currentSection]?.length - 1 &&
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
