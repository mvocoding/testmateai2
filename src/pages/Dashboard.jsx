import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const skills = [
  {
    name: 'Speaking',
    path: '/speaking',
    icon: '🏰',
    desc: 'Castle of Conversation',
    color: 'from-purple-400 to-pink-400',
    bgColor: 'from-purple-50 to-pink-50',
    progress: 75,
    lastScore: 7.5,
  },
  {
    name: 'Listening',
    path: '/listening',
    icon: '🌲',
    desc: 'Whispering Forest',
    color: 'from-green-400 to-emerald-400',
    bgColor: 'from-green-50 to-emerald-50',
    progress: 60,
    lastScore: 6.8,
  },
  {
    name: 'Writing',
    path: '/writing',
    icon: '⛰️',
    desc: 'Mountain of Mastery',
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'from-blue-50 to-cyan-50',
    progress: 45,
    lastScore: 6.2,
  },
  {
    name: 'Reading',
    path: '/reading',
    icon: '📚',
    desc: 'Library of Knowledge',
    color: 'from-orange-400 to-red-400',
    bgColor: 'from-orange-50 to-red-50',
    progress: 30,
    lastScore: 5.9,
  },
];

const achievements = [
  {
    name: 'First Steps',
    desc: 'Complete your first speaking test',
    icon: '🎯',
    earned: true,
  },
  {
    name: 'Listener',
    desc: 'Complete 5 listening exercises',
    icon: '👂',
    earned: true,
  },
  {
    name: 'Scholar',
    desc: 'Study for 7 days in a row',
    icon: '📚',
    earned: false,
  },
  { name: 'Master', desc: 'Score 8.0+ on any test', icon: '🏆', earned: false },
];

const recentActivity = [
  {
    type: 'speaking',
    action: 'Completed test',
    score: 7.5,
    time: '2 hours ago',
  },
  {
    type: 'listening',
    action: 'Finished exercise',
    score: 6.8,
    time: '1 day ago',
  },
  {
    type: 'writing',
    action: 'Submitted essay',
    score: 6.2,
    time: '2 days ago',
  },
  { type: 'reading', action: 'Read passage', score: 5.9, time: '3 days ago' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentLevel] = useState(3);
  const [currentXP] = useState(245);
  const [totalXP] = useState(500);
  const [studyStreak] = useState(5);
  const [totalTime] = useState(12.5);
  const [testsCompleted] = useState(23);

  const xpPercent = (currentXP / totalXP) * 100;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
            {' '}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Level Progress
              </h2>
              <div className="text-right">
                <div className="text-3xl font-black text-teal-700">
                  Level {currentLevel}
                </div>
                <div className="text-sm text-gray-600">
                  {currentXP} / {totalXP} XP
                </div>
              </div>
            </div>
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-4 bg-teal-500 transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-800">
                {studyStreak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-gray-800">
                {totalTime}h
              </div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-800">
                {testsCompleted}
              </div>
              <div className="text-sm text-gray-600">Tests Completed</div>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {activity.type === 'speaking'
                        ? '🏰'
                        : activity.type === 'listening'
                        ? '🌲'
                        : activity.type === 'writing'
                        ? '⛰️'
                        : '📚'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {activity.action}
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      Band {activity.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Continue Learning
            </h2>
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <button
                  key={skill.name}
                  onClick={() => navigate(skill.path)}
                  className="w-full group relative bg-white/60 hover:bg-white/80 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 border border-gray-300 hover:border-gray-400"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${skill.color} rounded-lg flex items-center justify-center text-white text-lg`}
                      >
                        {skill.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">
                          {skill.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {skill.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        Band {skill.lastScore}
                      </div>
                      <div className="text-xs text-gray-600">
                        {skill.progress}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${skill.color} rounded-full transition-all duration-300`}
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    achievement.earned ? 'bg-white/60' : 'bg-gray-100/60'
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      achievement.earned ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-semibold ${
                        achievement.earned ? 'text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      {achievement.name}
                    </div>
                    <div
                      className={`text-xs ${
                        achievement.earned ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {achievement.desc}
                    </div>
                  </div>
                  {achievement.earned && (
                    <div className="text-yellow-500 text-xl">✨</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
