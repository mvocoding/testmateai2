import React from "react";
import Icon from "../../components/Icon";

function ChatWindow({ messages, isLoading, onStartStudyPlanConversation, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
            <Icon name="chat" className="w-8 h-8 text-teal-600" />
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
              onClick={onStartStudyPlanConversation}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="document" className="w-5 h-5" />
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
                  <Icon name="bulb" className="w-4 h-4 text-gray-600" />
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
                <Icon name="bulb" className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatWindow;


