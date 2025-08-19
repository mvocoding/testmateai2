import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { generateStudyPlan as generateStudyPlanFromUtils } from '../utils';
import ChatWindow from './askmeanything/ChatWindow';
import ChatInput from './askmeanything/ChatInput';
import VoiceModal from './askmeanything/VoiceModal';

const TEXT_API_URL =
  'https://testmateai-be-670626115194.australia-southeast2.run.app/api/ai/generate_text';
const AUDIO_API_URL = 'http://localhost:3001/api/audio';
const DEFAULT_VOICE_ID = '6889b660662160e2caad5e3f';

function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function createMessage(text, sender, id = Date.now()) {
  return {
    id: id,
    text: text,
    sender: sender,
    timestamp: new Date().toLocaleTimeString(),
  };
}

function isStudyPlanConversation(messages) {
  return messages.some(
    (msg) =>
      msg.text.includes('Have you taken an IELTS test before') ||
      msg.text.includes('What was your last IELTS score') ||
      msg.text.includes('What is your target band score') ||
      msg.text.includes('When is your test date')
  );
}

function getSystemPrompt(isStudyPlanConversation) {
  if (isStudyPlanConversation) {
    return `You are an IELTS TestMate AI assistant helping to create a personalized study plan. You are currently in a conversation flow to gather information. Ask one question at a time and be conversational. The flow should be:
1. Ask if they've taken IELTS before (Yes/No)
2. If Yes: Ask for their last score
3. If No: Ask for their estimated current score
4. Ask for their target band score
5. Ask for their test date
6. Generate the study plan using the generateStudyPlan function

Be friendly and encouraging. Only ask one question at a time.

IMPORTANT: You must ALWAYS respond with a JSON object in this exact format:
{"response": "your message here"}

Never respond with plain text or any other format.`;
  } else {
    return `You are an IELTS TestMate AI assistant. Help users with IELTS preparation, answer questions about the test format, provide study tips, and assist with practice questions. You can also help users create personalized study plans. If users ask about study plans, guide them to use the study plan form or provide general study advice. Be friendly, encouraging, and knowledgeable about IELTS.

IMPORTANT: You must ALWAYS respond with a JSON object in this exact format:
{"response": "your message here"}

Never respond with plain text or any other format.`;
  }
}

function extractStudyPlanData(messages) {
  const data = {
    hasPreviousTest: false,
    currentScore: '',
    targetScore: '',
    testDate: '',
  };

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.sender === 'user') {
      const text = message.text.toLowerCase();

      if (
        text.includes('yes') &&
        i > 0 &&
        messages[i - 1].text.includes('Have you taken an IELTS test before')
      ) {
        data.hasPreviousTest = true;
      }

      // Extract score from text
      const scoreMatch = text.match(/(\d+\.?\d*)/);
      if (scoreMatch) {
        const score = parseFloat(scoreMatch[1]);
        if (score >= 0 && score <= 9) {
          if (data.hasPreviousTest && !data.currentScore) {
            data.currentScore = score.toString();
          } else if (!data.hasPreviousTest && !data.currentScore) {
            data.currentScore = score.toString();
          } else if (!data.targetScore) {
            data.targetScore = score.toString();
          }
        }
      }

      const dateMatch = text.match(
        /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}-\d{2}-\d{2})/
      );
      if (dateMatch && !data.testDate) {
        data.testDate = dateMatch[0];
      }
    }
  }

  return data;
}

// Helper function to check if study plan conversation is complete
function isStudyPlanComplete(messages) {
  const data = extractStudyPlanData(messages);
  return data.currentScore && data.targetScore && data.testDate;
}

function formatRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return [
      '• Practice regularly with focused exercises',
      '• Review your weak areas consistently',
      '• Take mock tests to track progress',
      '• Seek feedback on your performance',
    ].join('\n');
  }
  return recommendations.map((rec) => `• ${rec}`).join('\n');
}

function formatFocusAreas(focusAreas) {
  if (!focusAreas || focusAreas.length === 0) {
    return [
      '• Listening: Improve comprehension skills',
      '• Reading: Enhance speed and accuracy',
      '• Writing: Develop clear structure and vocabulary',
      '• Speaking: Build fluency and confidence',
    ].join('\n');
  }
  return focusAreas.map((area) => `• ${area.skill}: ${area.reason}`).join('\n');
}

function formatWeeklySchedule(weeklySchedule) {
  if (!weeklySchedule || weeklySchedule.length === 0) {
    return [
      'Week 1: Foundation - Review basics, assess current level',
      'Week 2: Listening Focus - Practice with various accents',
      'Week 3: Reading Focus - Improve skimming and scanning',
      'Week 4: Writing Focus - Essay structure and vocabulary',
    ].join('\n');
  }
  return weeklySchedule
    .map(
      (week) => `Week ${week.week}: ${week.focus} - ${week.tasks?.join(', ')}`
    )
    .join('\n');
}

function createStudyPlanMessage(plan, data) {
  const planText = `📚 ** Your Personalized Study Plan **

** Summary: ** ${
    plan.summary ||
    'Personalized study plan to help you achieve your target score'
  }

** Current Score: ** ${data.currentScore} | ** Target Score: ** ${
    data.targetScore
  }
** Study Duration: ** ${plan.weeks || '8'} weeks

** Key Recommendations: **
${formatRecommendations(plan.recommendations)}

** Focus Areas: **
${formatFocusAreas(plan.focus_areas)}

** Weekly Schedule: **
${formatWeeklySchedule(plan.weekly_schedule)}`;

  return createMessage(planText, 'ai', Date.now() + 2);
}

function saveStudyPlanToStorage(plan) {
  try {
    localStorage.setItem('testmate_study_plan', JSON.stringify(plan));
    try {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    } catch (error) {
      console.log('Error dispatching event:', error);
    }
  } catch (error) {
    console.log('Error saving study plan to storage:', error);
  }
}

// Helper function to fetch audio from API
async function fetchAudioFromAPI(
  text,
  rate = '100%',
  voice_id = DEFAULT_VOICE_ID
) {
  try {
    const response = await fetch(AUDIO_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text,
        rate,
        voice_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.audioUrl) {
      return result.audioUrl;
    } else {
      throw new Error(`API error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    throw error;
  }
}

function AskMeAnything() {
  // State variables for managing the chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // State variables for voice chat
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isContinuousRecording, setIsContinuousRecording] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Refs for DOM elements and voice recognition
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  // Refs to track state in async functions
  const isContinuousRecordingRef = useRef(isContinuousRecording);
  const isProcessingResponseRef = useRef(isProcessingResponse);
  const isAudioPlayingRef = useRef(isAudioPlaying);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isContinuousRecordingRef.current = isContinuousRecording;
    isProcessingResponseRef.current = isProcessingResponse;
    isAudioPlayingRef.current = isAudioPlaying;
  }, [isContinuousRecording, isProcessingResponse, isAudioPlaying]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleAudioStart() {
      setIsAudioPlaying(true);
    }

    function handleAudioEnd() {
      setIsAudioPlaying(false);
      setIsProcessingResponse(false);

      setTimeout(() => {
        if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
          try {
            voiceRecognitionRef.current.start();
          } catch (error) {
            if (isContinuousRecordingRef.current) {
              startContinuousVoiceChat();
            }
          }
        }
      }, 1500);
    }

    function handleAudioError() {
      console.log('Audio error - attempting to restart recognition');
      setIsAudioPlaying(false);
      setIsProcessingResponse(false);
      if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
        setTimeout(() => {
          if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
            try {
              voiceRecognitionRef.current.start();
            } catch (error) {
              console.log('Error restarting after audio error:', error);
            }
          }
        }, 1000);
      }
    }

    audio.addEventListener('play', handleAudioStart);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('play', handleAudioStart);
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [isContinuousRecording, isProcessingResponse]);

  function startVoiceChat() {
    setIsVoiceModalOpen(true);
  }

  function startContinuousVoiceChat() {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsContinuousRecording(true);
      setIsRecording(true);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);

      if (isContinuousRecordingRef.current) {
        console.log('Attempting to restart speech recognition...');
        setTimeout(() => {
          if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
            try {
              voiceRecognitionRef.current.start();
            } catch (error) {
              if (isContinuousRecordingRef.current) {
                startContinuousVoiceChat();
              }
            }
          } else {
            console.log('Cannot restart - conditions not met:', {
              isContinuousRecording: isContinuousRecordingRef.current,
              hasVoiceRecognition: !!voiceRecognitionRef.current,
            });
          }
        }, 1000);
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setIsProcessingResponse(true);
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }

      await handleSendMessage(transcript, true);
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        if (
          isContinuousRecordingRef.current &&
          !isProcessingResponseRef.current &&
          !isAudioPlayingRef.current
        ) {
          setTimeout(() => {
            if (
              isContinuousRecordingRef.current &&
              !isProcessingResponseRef.current &&
              !isAudioPlayingRef.current &&
              voiceRecognitionRef.current
            ) {
              try {
                console.log('Restarting after no-speech error...');
                voiceRecognitionRef.current.start();
              } catch (error) {}
            }
          }, 1000);
        }
      } else {
        setIsContinuousRecording(false);
        alert('Voice recognition error: ' + event.error);
      }
    };

    voiceRecognitionRef.current = recognition;
    recognition.start();
  }

  function stopContinuousVoiceChat() {
    setIsContinuousRecording(false);
    setIsProcessingResponse(false);
    setIsAudioPlaying(false);
    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch (error) {}
      voiceRecognitionRef.current = null;
    }
    setIsRecording(false);
  }

  function closeVoiceModal() {
    stopContinuousVoiceChat();
    setIsProcessingResponse(false);
    setIsAudioPlaying(false);
    setIsVoiceModalOpen(false);
  }

  useEffect(() => {
    return () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
        voiceRecognitionRef.current = null;
      }
    };
  }, []);

  async function handleSendMessage(overrideInput, isVoice = false) {
    const messageToSend =
      overrideInput !== undefined ? overrideInput : inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = createMessage(messageToSend, 'user');
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const headers = {
        'content-type': 'application/json',
      };

      const studyPlanConversation = isStudyPlanConversation(messages);
      const systemPrompt = getSystemPrompt(studyPlanConversation);
      const payload = { prompt: `${systemPrompt}\n\nUser: ${messageToSend}` };

      const response = await fetch(TEXT_API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse =
        data?.data?.response || "I'm sorry, I couldn't process that response.";

      const aiMessage = createMessage(aiResponse, 'ai', Date.now() + 1);
      setMessages((prev) => [...prev, aiMessage]);

      if (isVoice) {
        try {
          const audioUrl = await fetchAudioFromAPI(aiResponse);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            setIsAudioPlaying(true);
            audioRef.current.play();
          }
        } catch (error) {
          if (!isContinuousRecording) {
            alert('Failed to fetch or play audio: ' + error.message);
          }
          setIsProcessingResponse(false);
        }
      } else {
        setIsProcessingResponse(false);
      }

      const updatedMessages = [...messages, userMessage, aiMessage];
      if (isStudyPlanComplete(updatedMessages)) {
        const studyPlanData = extractStudyPlanData(updatedMessages);
        setIsGeneratingPlan(true);

        try {
          const plan = await generateStudyPlanFromUtils({
            currentScore: studyPlanData.currentScore,
            targetScore: studyPlanData.targetScore,
            testDate: studyPlanData.testDate,
          });

          if (plan) {
            saveStudyPlanToStorage(plan);
            const planMessage = createStudyPlanMessage(plan, studyPlanData);
            setMessages((prev) => [...prev, planMessage]);
          }
        } catch (error) {
        } finally {
          setIsGeneratingPlan(false);
        }
      }
    } catch (error) {
      const errorMessage = createMessage(
        "Sorry, I'm having trouble connecting right now. Please try again later.",
        'ai',
        Date.now() + 1
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  function startStudyPlanConversation() {
    const initialMessage = createMessage(
      "I'd love to help you create a personalized study plan! Let me ask you a few questions to get started.\n\nHave you taken an IELTS test before? (Yes/No)",
      'ai'
    );
    setMessages([initialMessage]);
  }

  function handleManualRestart() {
    if (voiceRecognitionRef.current && isContinuousRecordingRef.current) {
      try {
        console.log('Manual restart...');
        voiceRecognitionRef.current.start();
      } catch (error) {}
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-teal-600 hover:text-teal-700">
              <Icon name="arrow-left" className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Ask Me Anything
            </h1>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full mx-auto">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onStartStudyPlanConversation={startStudyPlanConversation}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          inputRef={inputRef}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isLoading={isLoading}
          onSend={() => handleSendMessage()}
          onStartVoiceChat={startVoiceChat}
          onStartStudyPlanConversation={startStudyPlanConversation}
        />

        <audio ref={audioRef} controls style={{ display: 'none' }} />
      </div>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={closeVoiceModal}
        isContinuousRecording={isContinuousRecording}
        isProcessingResponse={isProcessingResponse}
        isAudioPlaying={isAudioPlaying}
        isRecording={isRecording}
        onStartContinuous={startContinuousVoiceChat}
        onStopContinuous={stopContinuousVoiceChat}
        onManualRestart={handleManualRestart}
      />
    </div>
  );
}

export default AskMeAnything;
