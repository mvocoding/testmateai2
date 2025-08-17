import React, { useState, useEffect } from 'react';
import { generateVocabularyQuiz } from '../utils';
import { getVocabulary } from '../services/dataService';

const Review = () => {
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVocabularyWords = () => {
      const vocabulary = getVocabulary();
      setVocabularyWords(vocabulary.map(v => v.word));
    };

    loadVocabularyWords();
  }, []);

  const startQuiz = async () => {
    if (vocabularyWords.length === 0) {
      alert('No vocabulary words available for review.');
      return;
    }
    
    console.log('Starting quiz with vocabulary words:', vocabularyWords);

    setIsLoading(true);
    try {
      const quiz = await generateVocabularyQuiz(vocabularyWords);
      console.log('Quiz data received:', quiz);
      console.log('Quiz questions:', quiz?.questions);
      
      if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error('Invalid quiz structure received');
      }
      
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setIsQuizMode(true);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

     const handleAnswerSelect = (answer) => {
     if (isAnswered || !currentQuiz?.questions?.[currentQuestionIndex]) return;
     setSelectedAnswer(answer);
     setIsAnswered(true);
     
     if (answer === currentQuiz.questions[currentQuestionIndex].correct_answer) {
       setScore(score + 1);
     }
   };

     const nextQuestion = () => {
     if (currentQuestionIndex < (currentQuiz?.questions?.length || 0) - 1) {
       setCurrentQuestionIndex(currentQuestionIndex + 1);
       setSelectedAnswer(null);
       setIsAnswered(false);
     } else {
       setIsQuizMode(false);
       setCurrentQuiz(null);
     }
   };

  const resetQuiz = () => {
    setIsQuizMode(false);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
  };

  const currentQuestion = currentQuiz?.questions?.[currentQuestionIndex];
  console.log('Current quiz:', currentQuiz);
  console.log('Current question index:', currentQuestionIndex);
  console.log('Current question:', currentQuestion);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">
            Vocabulary Review
          </h1>
          <p className="text-gray-600 text-lg">
            Review and practice vocabulary words from your test results
          </p>
        </div>

        {!isQuizMode ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Vocabulary Words ({vocabularyWords.length})
              </h2>
              <button
                onClick={startQuiz}
                disabled={isLoading || vocabularyWords.length === 0}
                className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Quiz...
                  </div>
                ) : (
                  'Start Quiz'
                )}
              </button>
            </div>

            {vocabularyWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-600 text-lg">
                  No vocabulary words available for review yet.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Complete some tests to build your vocabulary list.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vocabularyWords.map((word, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-purple-800 font-semibold text-lg">
                      {word}
                    </div>
                    <div className="text-purple-600 text-sm mt-1">
                      Word #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Vocabulary Quiz
                </h2>
                                 <p className="text-gray-600">
                   Question {currentQuestionIndex + 1} of {currentQuiz?.questions?.length || 0}
                 </p>
              </div>
              <div className="text-right">
                                 <div className="text-2xl font-bold text-purple-600">
                   Score: {score}/{currentQuiz?.questions?.length || 0}
                 </div>
                 <div className="text-sm text-gray-500">
                   {Math.round((score / (currentQuiz?.questions?.length || 1)) * 100)}%
                 </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                             <div
                 className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
                 style={{
                   width: `${((currentQuestionIndex + 1) / (currentQuiz?.questions?.length || 1)) * 100}%`
                 }}
               ></div>
            </div>

             {currentQuestion ? (
               <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
                 <h3 className="text-xl font-semibold text-gray-800 mb-4">
                   {currentQuestion.question}
                 </h3>
                 <div className="text-lg text-purple-700 font-medium">
                   Word: <span className="text-purple-900">{currentQuestion.word}</span>
                 </div>
               </div>
             ) : (
               <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
                 <div className="text-center text-gray-600">
                   <p>No question available. Please try again.</p>
                   <button 
                     onClick={resetQuiz}
                     className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                   >
                     Restart Quiz
                   </button>
                 </div>
               </div>
             )}

             {currentQuestion && currentQuestion.options ? (
               <div className="space-y-3 mb-6">
                 {currentQuestion.options.map((option, index) => (
                 <button
                   key={index}
                   onClick={() => handleAnswerSelect(option)}
                   disabled={isAnswered}
                   className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                     isAnswered
                       ? option === currentQuestion.correct_answer
                         ? 'bg-green-100 border-green-400 text-green-800'
                         : option === selectedAnswer
                         ? 'bg-red-100 border-red-400 text-red-800'
                         : 'bg-gray-100 border-gray-300 text-gray-600'
                       : selectedAnswer === option
                       ? 'bg-purple-100 border-purple-400 text-purple-800'
                       : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        isAnswered
                          ? option === currentQuestion.correct_answer
                            ? 'bg-green-500 border-green-500 text-white'
                            : option === selectedAnswer
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-gray-300 border-gray-300 text-gray-600'
                          : selectedAnswer === option
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white border-gray-400 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="text-center text-gray-600">
                    <p>No answer options available.</p>
                  </div>
                </div>
              )}

             {isAnswered && currentQuestion && (
              <div className={`p-4 rounded-xl mb-6 ${
                selectedAnswer === currentQuestion.correct_answer
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-red-100 border border-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {selectedAnswer === currentQuestion.correct_answer ? '✅' : '❌'}
                  </span>
                  <span className={`font-semibold ${
                    selectedAnswer === currentQuestion.correct_answer
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}>
                    {selectedAnswer === currentQuestion.correct_answer
                      ? 'Correct!'
                      : 'Incorrect'}
                  </span>
                </div>
                <p className="text-gray-700">
                  <strong>Correct Answer:</strong> {currentQuestion.correct_answer}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-gray-600 text-sm mt-2">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetQuiz}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Exit Quiz
              </button>
              
                             {isAnswered && (
                 <button
                   onClick={nextQuestion}
                   className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                 >
                   {currentQuestionIndex < (currentQuiz?.questions?.length || 0) - 1
                     ? 'Next Question'
                     : 'Finish Quiz'}
                 </button>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
