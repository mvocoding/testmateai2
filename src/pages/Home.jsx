import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white relative overflow-hidden flex flex-col">
      {/* background decor */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-28 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-sky-400/20 to-indigo-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] rounded-full bg-gradient-to-b from-white/0 via-teal-100/30 to-white/0 blur-2xl" />
      <div className="text-center mb-10 p-10">
        <h1 className="text-5xl md:text-7xl font-black text-teal-700 mb-4 drop-shadow-lg">
          Welcome to TestMate AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
          Master IELTS with
          <span className="text-teal-600 font-bold">AI-powered</span> learning.
          <br />
          Practice speaking, get instant feedback, and level up your English
          skills in a gamified adventure!
        </p>
      </div>
      <div className="relative w-full max-w-4xl mx-auto mb-12">
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex-1 flex flex-col gap-6 items-center">
            <div className="w-full bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-2 border-2 border-gray-200">
              <h2 className="text-lg font-bold text-teal-700 flex items-center gap-2">
                <span role="img" aria-label="game">
                  🎮
                </span>
                Gamified Features
              </h2>
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
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl flex items-center gap-2 transition-transform duration-200 transform hover:scale-105"
            >
              <span role="img" aria-label="rocket">
                🚀
              </span>
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 transition-transform duration-200 transform hover:scale-105"
            >
              <span role="img" aria-label="play">
                ▶️
              </span>
              Watch Demo
            </a>
          </div>
        </div>
      </div>
      <section id="features" className="w-full max-w-5xl mx-auto mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4 flex items-center justify-center gap-2">
            <span role="img" aria-label="star">
              ⭐
            </span>
            Why Choose TestMate AI?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform provides everything you need to excel in
            your IELTS exam
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 border-2 border-primary-100">
            <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
              <span className="text-white text-3xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Diagnostic Tests
            </h3>
            <p className="text-gray-600 text-center">
              Quickly assess your current proficiency level and identify
              specific areas for improvement with our intelligent diagnostic
              system.
            </p>
          </div>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 text-center   border-2 border-secondary-100">
            <div className="w-14 h-14 bg-secondary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
              <span className="text-white text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-Time Speaking Feedback
            </h3>
            <p className="text-gray-600 text-center">
              Practice speaking with AI-powered feedback on pronunciation,
              fluency, and grammar aligned to IELTS standards.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl shadow flex flex-col items-center gap-4 border-2 border-primary-100">
            <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
              <span className="text-white text-3xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Progress Tracking
            </h3>
            <p className="text-gray-600 text-center">
              Monitor your development with detailed analytics and insights to
              stay motivated and focused on your goals.
            </p>
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                TestMate AI
              </h3>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
