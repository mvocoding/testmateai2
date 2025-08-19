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
import SubmitStatus from './mocktest/SubmitStatus';
import Controls from './mocktest/Controls';

const MockTest = () => {
  const [section, setSection] = useState('listening');
  const [qIdx, setQIdx] = useState(0);
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
  const [started, setStarted] = useState(false);
  const [showingIntro, setShowingIntro] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recognitionRef] = useState(useRef(null));
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState({
    listening: [],
    speaking: [],
    reading: [],
    writing: [],
  });

  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plays, setPlays] = useState(0);
  const [speechRef] = useState(useRef(null));
  const [submitting, setSubmitting] = useState(false);
  const [submitProg, setSubmitProg] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [fb, setFb] = useState({
    listening: [],
    reading: [],
    speaking: [],
    writing: [],
  });
  const [activeTab, setActiveTab] = useState('listening');

  const resetListening = () => {
    setPlays(0);
    setPlaying(false);
    setLoading(false);
    cancelSpeech();
  };

  const submitTest = async () => {
    setSubmitting(true);
    setSubmitProg(0);

    const listeningPassages = Array.isArray(questions.listening)
      ? questions.listening
      : [];
    const readingPassages = Array.isArray(questions.reading)
      ? questions.reading
      : [];
    const speakingItems = Array.isArray(questions.speaking)
      ? questions.speaking
      : [];
    const writingItems = Array.isArray(questions.writing)
      ? questions.writing
      : [];

    const total =
      listeningPassages.filter(
        (p) => p && Array.isArray(p.questions) && p.questions.length > 0
      ).length +
      readingPassages.filter(
        (p) => p && Array.isArray(p.questions) && p.questions.length > 0
      ).length +
      speakingItems.length +
      writingItems.length;
    setTotalTasks(total);

    try {
      const { aiFeedback: feedback, results } = await submitMockTest({
        questions,
        answers,
        onProgress: () => setSubmitProg((prev) => prev + 1),
      });

      setFb(feedback);
      setResults(results);
      setCompleted(true);
      setShowResults(true);
    } finally {
      setSubmitting(false);
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
    if (started && timeRemaining[section] > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => ({
          ...prev,
          [section]: prev[section] - 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, section, timeRemaining]);

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

    setStarted(true);
    setShowingIntro(true);
    setAnswers({});
    resetListening();
  };

  const startSection = () => {
    const currentQuestions = questions[section];
    if (!currentQuestions || currentQuestions.length === 0) {
      alert(
        `No questions available for ${section} section. Please try again.`
      );
      return;
    }
    clearSectionAnswers(section);
    setShowingIntro(false);
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
    if (!questions || !questions[section]) return;

    const currentQuestions = questions[section];
    const currentQ = currentQuestions[qIdx];

    if (currentQ && currentQ.type === 'passage' && currentQ.questions) {
      const newAnswers = { ...answers };
      currentQ.questions.forEach((_, subIndex) => {
        const answerKey = `${currentQ.id}-${subIndex}`;
        if (newAnswers[section][answerKey] !== undefined) {
          delete newAnswers[section][answerKey];
        }
      });
      setAnswers(newAnswers);
    } else if (currentQ) {
      const newAnswers = { ...answers };
      if (newAnswers[section][currentQ.id] !== undefined) {
        delete newAnswers[section][currentQ.id];
      }
      setAnswers(newAnswers);
    }
  };

  const nextQuestion = () => {
    if (!questions || !questions[section]) return;

    const currentQuestions = questions[section];
    if (qIdx < currentQuestions.length - 1) {
      clearCurrentQuestionAnswers();
      setQIdx((prev) => prev + 1);
      if (section === 'listening') {
        resetListening();
      }
    } else {
      // Move to next section
      const sectionIndex = sections.findIndex((s) => s.id === section);
      if (sectionIndex < sections.length - 1) {
        const nextSection = sections[sectionIndex + 1].id;
        setSection(nextSection);
        setQIdx(0);
        setShowingIntro(true);
        clearSectionAnswers(nextSection);
        resetListening();
      }
    }
  };

  const prevQuestion = () => {
    if (!questions) return;

    if (qIdx > 0) {
      clearCurrentQuestionAnswers();
      setQIdx((prev) => prev - 1);
      if (section === 'listening') {
        resetListening();
      }
    } else {
      const sectionIndex = sections.findIndex((s) => s.id === section);
      if (sectionIndex > 0) {
        const prevSection = sections[sectionIndex - 1].id;
        setSection(prevSection);
        setQIdx(questions[prevSection].length - 1);
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

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (
        questions &&
        questions.speaking &&
        questions.speaking[qIdx]
      ) {
        handleAnswer(
          'speaking',
          questions.speaking[qIdx].id,
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
    setRecording(false);
  };

  const startListening = () => {
    setLoading(true);
    const question = questions.listening[qIdx];
    const passageText =
      question.passageText || question.passage || 'No audio content available.';

    if (
      !passageText ||
      passageText.trim() === '' ||
      passageText === 'No audio content available.'
    ) {
      alert('No audio content available for this question.');
      setLoading(false);
      return;
    }

    if ('speechSynthesis' in window) {
      cancelSpeech();

      const utterance = new SpeechSynthesisUtterance(passageText);

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = getPreferredVoice(voices);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setPlaying(true);
        setLoading(false);
        setPlays((prev) => prev + 1);
      };
      utterance.onend = () => {
        setPlaying(false);
      };
      utterance.onerror = () => {
        setPlaying(false);
        setLoading(false);
      };

      speechRef.current = utterance;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        setPlaying(false);
        setLoading(false);
        alert('Error starting audio playback. Please try again.');
      }
    } else {
      alert('Text-to-speech is not supported in this browser.');
      setLoading(false);
    }
  };

  const stopListening = () => {
    if (speechRef.current) {
      cancelSpeech();
      setPlaying(false);
    }
  };

  const renderQuestion = () => {
    if (!questions || !questions[section]) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    const currentQuestions = questions[section];
    const question = currentQuestions[qIdx];

    if (!question) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 font-semibold mb-2">
            Question not found...
          </div>
          <div className="text-sm text-gray-600">
            Section: {section} | Question Index: {qIdx} |
            Total Questions: {currentQuestions.length}
          </div>
        </div>
      );
    }

    switch (section) {
      case 'listening':
        return (
          <ListeningQuestionBlock
            question={question}
            answersSection={answers.listening}
            onAnswer={(id, val) => handleAnswer('listening', id, val)}
            startListening={startListening}
            stopListening={stopListening}
            isPlaying={playing}
            isLoading={loading}
            playCount={plays}
          />
        );

      case 'speaking':
        return (
          <SpeakingQuestionBlock
            question={question}
            answersSection={answers.speaking}
            isRecording={recording}
            startRecording={startSpeakingRecording}
            stopRecording={stopSpeakingRecording}
          />
        );

      case 'reading':
        return (
          <ReadingQuestionBlock
            question={{ ...question, index: qIdx }}
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

  if (!started) {
    return (
      <StartScreen
        sections={sections}
        questions={questions}
        onStart={startTest}
      />
    );
  }

  if (showingIntro) {
    return (
      <SectionIntro
        intro={skillIntroductions[section]}
        onStart={startSection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TestHeader
        currentSectionName={sections.find((s) => s.id === section)?.name}
        currentQuestionIndex={qIdx + 1}
        totalQuestions={questions[section]?.length || 0}
        timeText={formatTime(timeRemaining[section])}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {showResults ? (
            <ResultsView
              testResults={results}
              aiFeedback={fb}
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              onRetake={() => {
                setShowResults(false);
                setCompleted(false);
                setResults(null);
                setAnswers({
                  listening: {},
                  speaking: {},
                  reading: {},
                  writing: {},
                });
                setSection('listening');
                setQIdx(0);
                setStarted(false);
                setShowingIntro(true);
              }}
            />
          ) : (
            <>
              {submitting ? <SubmitStatus submitting={submitting} submitProg={submitProg} totalTasks={totalTasks} /> : renderQuestion()}

              <Controls
                onPrev={prevQuestion}
                onNext={nextQuestion}
                onSubmit={submitTest}
                canPrev={
                  !!questions && !(qIdx === 0 && sections.findIndex((s) => s.id === section) === 0)
                }
                canNext={
                  !!questions && !(
                    qIdx === questions[section]?.length - 1 &&
                    sections.findIndex((s) => s.id === section) === sections.length - 1
                  )
                }
                canSubmit={
                  !submitting &&
                  qIdx === questions[section]?.length - 1 &&
                  sections.findIndex((s) => s.id === section) === sections.length - 1
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTest;
