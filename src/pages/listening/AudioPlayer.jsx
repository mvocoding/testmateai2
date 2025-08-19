import React from 'react';

const AudioPlayer = ({
  isPlaying,
  isLoading,
  playCount,
  isTimerActive,
  timeRemaining,
  onStart,
  onStop,
  formatTime,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-teal-800 mb-2">🎧 Audio Player</h3>
          <p className="text-sm text-teal-600">Listen to the passage and answer the questions below</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? onStop : onStart}
              disabled={isLoading}
              className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span role="img" aria-label="audio">{isPlaying ? '⏸️' : '▶️'}</span>
              {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play Audio'}
            </button>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2 text-teal-600">
              <div className="animate-pulse">🔊</div>
              <span className="text-sm font-medium">Playing audio...</span>
            </div>
          )}

          {!isPlaying && playCount > 0 && (
            <div className="text-sm text-gray-600">Audio ready to play again</div>
          )}
        </div>
      </div>

      {isTimerActive && (
        <div className="text-lg font-bold text-red-600">
          Time remaining: {formatTime(timeRemaining)}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;


