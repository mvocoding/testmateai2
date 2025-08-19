import React from "react";
import Icon from "../../components/Icon";

function ChatInput({
  inputRef,
  inputMessage,
  setInputMessage,
  isLoading,
  onSend,
  onStartVoiceChat,
  onStartStudyPlanConversation,
}) {
  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onStartVoiceChat}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            title="Start Voice Chat"
          >
            <Icon name="mic" className="w-4 h-4" />
            Voice Chat
          </button>
          <button
            onClick={onStartStudyPlanConversation}
            className="bg-teal-100 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-200 transition-colors flex items-center gap-2 text-sm"
            title="Create Study Plan"
          >
            <Icon name="document" className="w-4 h-4" />
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
              onClick={onSend}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="send" className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;


