import React from "react";
import Icon from "../../components/Icon";

function VoiceModal({
  isOpen,
  onClose,
  isContinuousRecording,
  isProcessingResponse,
  isAudioPlaying,
  isRecording,
  onStartContinuous,
  onStopContinuous,
  onManualRestart,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <Icon name="x" className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mic" className="w-10 h-10 text-purple-600" />
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
                onClick={onStartContinuous}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-3 w-full"
              >
                <Icon name="mic" className="w-6 h-6" />
                Start Voice Chat
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  >
                    <Icon name="mic" className="w-8 h-8 text-white" />
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
                    onClick={onStopContinuous}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Stop Recording
                  </button>
                  <button
                    onClick={onManualRestart}
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
  );
}

export default VoiceModal;


