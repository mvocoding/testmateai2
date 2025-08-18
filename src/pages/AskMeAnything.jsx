import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateStudyPlan } from '../utils';

const AskMeAnything = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isContinuousRecording, setIsContinuousRecording] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  const isContinuousRecordingRef = useRef(isContinuousRecording);
  const isProcessingResponseRef = useRef(isProcessingResponse);
  const isAudioPlayingRef = useRef(isAudioPlaying);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isContinuousRecordingRef.current = isContinuousRecording;
  }, [isContinuousRecording]);

  useEffect(() => {
    isProcessingResponseRef.current = isProcessingResponse;
  }, [isProcessingResponse]);

  useEffect(() => {
    isAudioPlayingRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioStart = () => {
      setIsAudioPlaying(true);
    };

    const handleAudioEnd = () => {
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
        } else {
        }
      }, 1500);
    };

    const handleAudioError = () => {
      console.log('Audio error - attempting to restart recognition');
      setIsAudioPlaying(false);
      setIsProcessingResponse(false);
      if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
        setTimeout(() => {
          if (isContinuousRecordingRef.current && voiceRecognitionRef.current) {
            try {
              voiceRecognitionRef.current.start();
            } catch (error) {}
          }
        }, 1000);
      }
    };

    audio.addEventListener('play', handleAudioStart);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('play', handleAudioStart);
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [isContinuousRecording, isProcessingResponse]);

  const startVoiceChat = () => {
    setIsVoiceModalOpen(true);
  };

  const startContinuousVoiceChat = () => {
    if (
      !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    recog.onstart = () => {
      console.log('Speech recognition started');
      setIsContinuousRecording(true);
      setIsRecording(true);
    };

    recog.onend = () => {
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
      } else {
      }
    };

    recog.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setIsProcessingResponse(true);
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }

      await handleSendMessage(transcript, true);
    };

    recog.onerror = (event) => {
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
              } catch (error) {
                console.error('Error restarting after no-speech:', error);
              }
            }
          }, 1000);
        }
      } else {
        setIsContinuousRecording(false);
        alert('Voice recognition error: ' + event.error);
      }
    };

    voiceRecognitionRef.current = recog;
    recog.start();
  };

  const stopContinuousVoiceChat = () => {
    setIsContinuousRecording(false);
    setIsProcessingResponse(false);
    setIsAudioPlaying(false);
    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      voiceRecognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const closeVoiceModal = () => {
    stopContinuousVoiceChat();
    setIsProcessingResponse(false);
    setIsAudioPlaying(false);
    setIsVoiceModalOpen(false);
  };

  useEffect(() => {
    return () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
        voiceRecognitionRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async (overrideInput, isVoice = false) => {
    const messageToSend =
      overrideInput !== undefined ? overrideInput : inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const headers = {
        'content-type': 'application/json',
      };

      const isStudyPlanConversation = messages.some(
        (msg) =>
          msg.text.includes('Have you taken an IELTS test before') ||
          msg.text.includes('What was your last IELTS score') ||
          msg.text.includes('What is your target band score') ||
          msg.text.includes('When is your test date')
      );

      const systemPrompt = isStudyPlanConversation
        ? `You are an IELTS TestMate AI assistant helping to create a personalized study plan. You are currently in a conversation flow to gather information. Ask one question at a time and be conversational. The flow should be:
1. Ask if they've taken IELTS before (Yes/No)
2. If Yes: Ask for their last score
3. If No: Ask for their estimated current score
4. Ask for their target band score
5. Ask for their test date
6. Generate the study plan using the generateStudyPlan function

Be friendly and encouraging. Only ask one question at a time.

IMPORTANT: You must ALWAYS respond with a JSON object in this exact format:
{"response": "your message here"}

Never respond with plain text or any other format.`
        : `You are an IELTS TestMate AI assistant. Help users with IELTS preparation, answer questions about the test format, provide study tips, and assist with practice questions. You can also help users create personalized study plans. If users ask about study plans, guide them to use the study plan form or provide general study advice. Be friendly, encouraging, and knowledgeable about IELTS.

IMPORTANT: You must ALWAYS respond with a JSON object in this exact format:
{"response": "your message here"}

Never respond with plain text or any other format.`;

      const payload = { prompt: `${systemPrompt}\n\nUser: ${messageToSend}` };

      const response = await fetch(
        'https://testmateai-be-670626115194.australia-southeast2.run.app/api/ai/generate_text',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse =
        data?.data?.response || "I'm sorry, I couldn't process that response.";

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (isVoice) {
        try {
          const audioUrl = await fetchAudioFromAPI(aiResponse);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            setIsAudioPlaying(true);
            audioRef.current.play();
          }
        } catch (err) {
          console.error('Failed to fetch or play audio:', err);
          if (!isContinuousRecording) {
            alert('Failed to fetch or play audio: ' + err.message);
          }
          setIsProcessingResponse(false);
        }
      } else {
        setIsProcessingResponse(false);
      }

      const updatedMessages = [...messages, userMessage, aiMessage];
      if (checkIfStudyPlanComplete(updatedMessages)) {
        const data = extractStudyPlanData(updatedMessages);
        setIsGeneratingPlan(true);

        try {
          const plan = await generateStudyPlan({
            currentScore: data.currentScore,
            targetScore: data.targetScore,
            testDate: data.testDate,
          });

          if (plan) {
            const planMessage = {
              id: Date.now() + 2,
              text: `📚 **Your Personalized Study Plan**\n\n**Summary:** ${
                plan.summary ||
                'Personalized study plan to help you achieve your target score'
              }\n\n**Current Score:** ${
                data.currentScore
              } | **Target Score:** ${data.targetScore}\n**Study Duration:** ${
                plan.weeks || '8'
              } weeks\n\n**Key Recommendations:**\n${
                plan.recommendations?.map((rec) => `• ${rec}`).join('\n') ||
                '• Practice regularly with focused exercises\n• Review your weak areas consistently\n• Take mock tests to track progress\n• Seek feedback on your performance'
              }\n\n**Focus Areas:**\n${
                plan.focus_areas
                  ?.map((area) => `• ${area.skill}: ${area.reason}`)
                  .join('\n') ||
                '• Listening: Improve comprehension skills\n• Reading: Enhance speed and accuracy\n• Writing: Develop clear structure and vocabulary\n• Speaking: Build fluency and confidence'
              }\n\n**Weekly Schedule:**\n${
                plan.weekly_schedule
                  ?.map(
                    (week) =>
                      `Week ${week.week}: ${week.focus} - ${week.tasks?.join(
                        ', '
                      )}`
                  )
                  .join('\n') ||
                'Week 1: Foundation - Review basics, assess current level\nWeek 2: Listening Focus - Practice with various accents\nWeek 3: Reading Focus - Improve skimming and scanning\nWeek 4: Writing Focus - Essay structure and vocabulary'
              }`,
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, planMessage]);
          }
        } catch (error) {
          console.error('Error generating study plan:', error);
        } finally {
          setIsGeneratingPlan(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const startStudyPlanConversation = () => {
    const initialMessage = {
      id: Date.now(),
      text: "I'd love to help you create a personalized study plan! Let me ask you a few questions to get started.\n\nHave you taken an IELTS test before? (Yes/No)",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([initialMessage]);
  };

  const extractStudyPlanData = (messages) => {
    const data = {
      hasPreviousTest: false,
      currentScore: '',
      targetScore: '',
      testDate: '',
    };

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.sender === 'user') {
        const text = msg.text.toLowerCase();

        if (
          text.includes('yes') &&
          i > 0 &&
          messages[i - 1].text.includes('Have you taken an IELTS test before')
        ) {
          data.hasPreviousTest = true;
        }

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
  };

  const checkIfStudyPlanComplete = (messages) => {
    const data = extractStudyPlanData(messages);
    return data.currentScore && data.targetScore && data.testDate;
  };

  const fetchAudioFromAPI = async (
    text,
    rate = '100%',
    voice_id = '6889b660662160e2caad5e3f'
  ) => {
    const api_url = 'http://localhost:3001/api/audio';

    try {
      const response = await fetch(api_url, {
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
      console.error('Error fetching audio from API:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
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

      <div className="flex-1 flex flex-col w-full mx-auto ">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-600 max-w-md mb-6">
                I'm your IELTS TestMate AI assistant. Ask me anything about
                IELTS preparation, test format, study tips, or practice
                questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startStudyPlanConversation}
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Create Study Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl ${
                      message.sender === 'user' ? 'order-2' : 'order-1'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === 'user'
                            ? 'text-teal-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-3 ${
                      message.sender === 'user'
                        ? 'order-1 bg-teal-600'
                        : 'order-2 bg-gray-200'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <span className="text-white text-sm font-semibold">
                        U
                      </span>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="order-2">
                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-3 order-1">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto">
            <div className="flex gap-3">
              <button
                onClick={startVoiceChat}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                title="Start Voice Chat"
              >
                <svg
                  className="w-4 h-4"
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
                Voice Chat
              </button>
              <button
                onClick={startStudyPlanConversation}
                className="bg-teal-100 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-200 transition-colors flex items-center gap-2 text-sm"
                title="Create Study Plan"
              >
                <svg
                  className="w-4 h-4"
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
                Study Plan
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message TestMate AI..."
                  className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="4"
                  disabled={isLoading}
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <audio ref={audioRef} controls style={{ display: 'none' }} />
        </div>
      </div>

      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={closeVoiceModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-purple-600"
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
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Voice Chat
              </h2>

              <p className="text-gray-600 mb-8">
                {isContinuousRecording
                  ? isProcessingResponse
                    ? 'Processing your message and generating response...'
                    : isAudioPlaying
                    ? 'Playing AI response... Please wait.'
                    : "I'm listening... Speak naturally and I'll respond by voice."
                  : 'Click the button below to start a continuous voice conversation.'}
              </p>

              <div className="space-y-4">
                {!isContinuousRecording ? (
                  <button
                    onClick={startContinuousVoiceChat}
                    className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-3 w-full"
                  >
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
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Start Voice Chat
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isRecording
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      >
                        <svg
                          className="w-8 h-8 text-white"
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
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      {isProcessingResponse
                        ? 'Processing response...'
                        : isAudioPlaying
                        ? 'Playing AI response...'
                        : isRecording
                        ? 'Listening...'
                        : 'Ready...'}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={stopContinuousVoiceChat}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Stop Recording
                      </button>
                      <button
                        onClick={() => {
                          if (
                            voiceRecognitionRef.current &&
                            isContinuousRecordingRef.current
                          ) {
                            try {
                              console.log('Manual restart...');
                              voiceRecognitionRef.current.start();
                            } catch (error) {
                              console.error('Manual restart failed:', error);
                            }
                          }
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Restart
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>• Speak clearly and naturally</p>
                <p>• I'll respond with voice after each message</p>
                <p>• Click "Stop Recording" to pause</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskMeAnything;
