import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SpeakingTest from './pages/SpeakingTest';
import Listening from './pages/Listening';
import Reading from './pages/Reading';
import Writing from './pages/Writing';
import Dashboard from './pages/Dashboard';
// import StudyPlan from './pages/StudyPlan';
import AskMeAnything from './pages/AskMeAnything';
import MockTest from './pages/MockTest';
import Review from './pages/Review';
import { AskMeButton } from './components/AskMeButton';
import { getUser } from './services/dataService';
import './App.css';

const skills = [
  { name: 'Speaking', path: '/speaking', color: 'from-blue-400 to-cyan-400' },
  { name: 'Listening', path: '/listening', color: 'from-blue-400 to-cyan-400' },
  { name: 'Reading', path: '/reading', color: 'from-blue-400 to-cyan-400' },
  { name: 'Writing', path: '/writing', color: 'from-blue-400 to-cyan-400' },
];

const utilityButtons = [
  {
    name: 'Mock Test',
    path: '/mocktest',
    icon: '📝',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    name: 'Ask Me',
    path: '/ask-me',
    icon: '💬',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    name: 'Review',
    path: '/review',
    icon: '👤',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: '📈',
    color: 'from-indigo-400 to-purple-400',
  },
];

function SkillSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserData = () => {
      const userData = getUser();
      console.log('Loading user data in sidebar:', userData);
      setUser(userData);
    };

    loadUserData();

    // Refresh user data when localStorage changes
    const handleStorageChange = () => {
      console.log('Storage changed, refreshing user data');
      loadUserData();
    };

    const handleUserDataUpdate = () => {
      console.log('User data updated event received, refreshing user data');
      loadUserData();
    };

    // Poll for user data changes every 2 seconds as a fallback
    const pollInterval = setInterval(() => {
      const currentUser = getUser();
      if (currentUser && (!user || currentUser.xp !== user.xp || currentUser.level !== user.level)) {
        console.log('User data changed detected by polling, updating sidebar');
        setUser(currentUser);
      }
    }, 2000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
      clearInterval(pollInterval);
    };
  }, [user]); // Include user in dependency array

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const totalXP = 100; // XP needed for next level
  const xpPercent = (xp / totalXP) * 100;

  const handleLogout = () => {
    navigate('/');
  };

  // const handleRefresh = () => {
  //   const userData = getUser();
  //   console.log('Manual refresh - user data:', userData);
  //   setUser(userData);
  // };

  return (
    <aside className="h-screen w-56 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border-r border-white/50 flex flex-col items-center py-2 fixed left-0 top-0 z-40 shadow-2xl">
      <div className="mb-2  text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
        {user?.name || 'Student'}
      </div>

      <div className="w-full p-2 ">
        <div className="flex items-center gap-3 mb-2">
          <span className="m-auto inline-block bg-purple-600 text-white text-base font-bold px-4 py-1 rounded-full shadow">
            🏅 Level {level}
          </span>
          <span
            onClick={handleLogout}
            className="inline-flex items-center gap-2 p-2 cursor-pointer rounded-lg bg-gradient-to-r from-red-400 to-pink-500 text-white text-sm font-medium hover:brightness-110 transition"
          >
            🔚
          </span>
        </div>
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-3 bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          ></div>
        </div>
      </div>
      <div className="w-full p-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      <nav className="flex flex-col gap-3 w-full px-4 py-2">
        {skills.map((skill) => (
          <NavLink
            key={skill.name}
            to={skill.path}
            className={({ isActive }) =>
              `group relative w-full p-2 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 text-lg transform hover:scale-105 ${
                isActive
                  ? `bg-gradient-to-r ${skill.color} text-white shadow-lg border-2 border-white/20`
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-white/30'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="font-semibold">{skill.name}</span>
                {isActive && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-2xl opacity-20 blur-lg -z-10`}
                  ></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="w-full p-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      <nav className="flex flex-col gap-3 w-full px-4 mb-6">
        {utilityButtons.map((button) => (
          <NavLink
            key={button.name}
            to={button.path}
            className={({ isActive }) =>
              `group relative w-full p-2 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 text-lg transform hover:scale-105 ${
                isActive
                  ? `bg-gradient-to-r ${button.color} text-white shadow-lg border-2 border-white/20`
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-white/30'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-lg transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'animate-pulse' : ''
                  }`}
                >
                  {button.icon}
                </span>
                <span className="font-semibold">{button.name}</span>
                {isActive && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${button.color} rounded-2xl opacity-20 blur-lg -z-10`}
                  ></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function AppLayout() {
  const location = useLocation();
  const showSidebar = [
    '/speaking',
    '/listening',
    '/reading',
    '/writing',
    '/dashboard',
    '/study-plan',
    '/ask-me',
    '/mocktest',
    '/review',
  ].some((path) => location.pathname.startsWith(path));
  return (
    <div className="flex min-h-screen min-w-full bg-gray-50">
      <AskMeButton></AskMeButton>
      {showSidebar && <SkillSidebar />}
      <main className={showSidebar ? 'flex-1 ml-56' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/speaking" element={<SpeakingTest />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/ask-me" element={<AskMeAnything />} />
          <Route path="/mocktest" element={<MockTest />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review" element={<Review />} />
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
