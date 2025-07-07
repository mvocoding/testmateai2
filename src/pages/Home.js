import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-300 to-red-300 rounded-full opacity-20 animate-pulse"></div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Welcome to TestMate AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Master IELTS with <span className="text-primary-600 font-bold">AI-powered</span> learning.<br />
            Practice speaking, get instant feedback, and level up your English skills in a gamified adventure!
          </p>
        </div>
        <div className="relative w-full max-w-4xl mx-auto mb-12">
          <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex-1 flex flex-col gap-6 items-center">
              <div className="w-full bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-2 border-2 border-primary-200">
                <h2 className="text-lg font-bold text-primary-700 flex items-center gap-2"><span role="img" aria-label="game">🎮</span> Gamified Features</h2>
                <ul className="list-disc list-inside text-gray-700 text-base pl-2">
                  <li>AI-powered speaking practice</li>
                  <li>Real-time feedback and scoring</li>
                  <li>Level up and earn XP</li>
                  <li>Track your progress</li>
                  <li>Beautiful, modern game-inspired UI</li>
                </ul>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-6 items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary-600 to-green-400 hover:from-primary-700 hover:to-green-500 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl flex items-center gap-2 transition-transform duration-200 transform hover:scale-105"
              >
                <span role="img" aria-label="rocket">🚀</span> Start Free Trial
              </Link>
              <a
                href="#features"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 transition-transform duration-200 transform hover:scale-105"
              >
                <span role="img" aria-label="play">▶️</span> Watch Demo
              </a>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <section id="features" className="w-full max-w-5xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4 flex items-center justify-center gap-2">
              <span role="img" aria-label="star">⭐</span> Why Choose TestMate AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to excel in your IELTS exam
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 border-2 border-primary-100">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-3xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Diagnostic Tests</h3>
              <p className="text-gray-600 text-center">
                Quickly assess your current proficiency level and identify specific areas for improvement with our intelligent diagnostic system.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 text-center   border-2 border-secondary-100">
              <div className="w-14 h-14 bg-secondary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Speaking Feedback</h3>
              <p className="text-gray-600 text-center">
                Practice speaking with AI-powered feedback on pronunciation, fluency, and grammar aligned to IELTS standards.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 border-2 border-primary-100">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-center">
                Monitor your development with detailed analytics and insights to stay motivated and focused on your goals.
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">TestMate AI <span role="img" aria-label="ai">🤖</span></h3>
              <p className="text-gray-400">
                Empowering international students to achieve their English language goals through AI-powered learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Diagnostic Tests</li>
                <li>Speaking Practice</li>
                <li>Mock Exams</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TestMate AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home; 