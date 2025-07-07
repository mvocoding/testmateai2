import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SpeakingTest from './pages/SpeakingTest';
import Listening from './pages/Listening';
import Reading from './pages/Reading';
import Writing from './pages/Writing';
import Dashboard from './pages/Dashboard';
import StudyPlan from './pages/StudyPlan';
import './App.css';

const skills = [
  { name: 'Speaking', path: '/speaking', icon: '🏰', color: 'from-purple-400 to-pink-400' },
  { name: 'Listening', path: '/listening', icon: '🌲', color: 'from-green-400 to-emerald-400' },
  { name: 'Reading', path: '/reading', icon: '📚', color: 'from-orange-400 to-red-400' },
  { name: 'Writing', path: '/writing', icon: '⛰️', color: 'from-blue-400 to-cyan-400' },
];

const utilityButtons = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊', color: 'from-indigo-400 to-purple-400' },
  { name: 'AI Study Plan', path: '/study-plan', icon: '🤖', color: 'from-teal-400 to-cyan-400' },
];

function SkillSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  // Placeholder values for level/xp
  const level = 3;
  const xp = 245;
  const totalXP = 500;
  const xpPercent = (xp / totalXP) * 100;

  const handleLogout = () => {
    // Add logout logic here (clear tokens, redirect to login, etc.)
    navigate('/login');
  };

  return (
    <aside className="h-screen w-56 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border-r border-white/50 flex flex-col items-center py-8 fixed left-0 top-0 z-40 shadow-2xl">
      <div className="mb-8 text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
        TestMate
      </div>
      
      {/* Main Skills Navigation */}
      <nav className="flex flex-col gap-3 w-full px-4 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Skills</h3>
        {skills.map(skill => (
          <NavLink
            key={skill.name}
            to={skill.path}
            className={({ isActive }) =>
              `group relative w-full px-4 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 text-lg transform hover:scale-105 ${
                isActive
                  ? `bg-gradient-to-r ${skill.color} text-white shadow-lg border-2 border-white/20`
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-white/30'
              }`
            }
          >
            <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${({ isActive }) => isActive ? 'animate-pulse' : ''}`}>
              {skill.icon}
            </span>
            <span className="font-semibold">{skill.name}</span>
            {/* Glow effect for active state */}
            {({ isActive }) => isActive && (
              <div className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-2xl opacity-20 blur-lg -z-10`}></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separator */}
      <div className="w-full px-4 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Utility Navigation */}
      <nav className="flex flex-col gap-3 w-full px-4 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Tools</h3>
        {utilityButtons.map(button => (
          <NavLink
            key={button.name}
            to={button.path}
            className={({ isActive }) =>
              `group relative w-full px-4 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 text-lg transform hover:scale-105 ${
                isActive
                  ? `bg-gradient-to-r ${button.color} text-white shadow-lg border-2 border-white/20`
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-white/30'
              }`
            }
          >
            <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${({ isActive }) => isActive ? 'animate-pulse' : ''}`}>
              {button.icon}
            </span>
            <span className="font-semibold">{button.name}</span>
            {/* Glow effect for active state */}
            {({ isActive }) => isActive && (
              <div className={`absolute inset-0 bg-gradient-to-r ${button.color} rounded-2xl opacity-20 blur-lg -z-10`}></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separator */}
      <div className="w-full px-4 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* XP/Level Progress */}
      <div className="w-full px-4 mb-6 mt-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block bg-purple-600 text-white text-lg font-bold px-4 py-1 rounded-full shadow">🏅 Level {level}</span>
          <span className="text-xs text-gray-500 font-semibold">XP</span>
        </div>
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-3 bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          ></div>
          <span className="absolute right-2 top-0 text-xs text-white font-bold drop-shadow">{xp} / {totalXP}</span>
        </div>
      </div>

      {/* Logout Button */}
      <div className="w-full px-4 mb-6">
        <button
          onClick={handleLogout}
          className="group relative w-full px-4 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 text-lg transform hover:scale-105 bg-white/60 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-md border-2 border-transparent hover:border-red-200"
        >
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110">⏻</span>
          <span className="font-semibold">Logout</span>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="mb-4 text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
          🎯
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">Level Up!</p>
      </div>
    </aside>
  );
}

function AppLayout() {
  const location = useLocation();
  // Show sidebar on skill pages and dashboard
  const showSidebar = ['/speaking', '/listening', '/reading', '/writing', '/dashboard', '/study-plan'].some(path => location.pathname.startsWith(path));
  return (
    <div className="flex min-h-screen">
      {showSidebar && <SkillSidebar />}
      <main className={showSidebar ? 'flex-1 ml-56' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/speaking" element={<SpeakingTest />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/writing" element={<Writing />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
