import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardData,
  getUser,
  generateStudyPlan,
} from '../services/dataService';

const getSkillsData = (dashboardData) => [
  {
    name: 'Speaking',
    path: '/speaking',
    icon: '🏰',
    desc: 'Castle of Conversation',
    color: 'from-purple-400 to-pink-400',
    bgColor: 'from-purple-50 to-pink-50',
    progress: dashboardData?.practiceStats?.speaking || 0,
    lastScore: parseFloat(dashboardData?.averageScores?.speaking) || 0,
  },
  {
    name: 'Listening',
    path: '/listening',
    icon: '🌲',
    desc: 'Whispering Forest',
    color: 'from-green-400 to-emerald-400',
    bgColor: 'from-green-50 to-emerald-50',
    progress: dashboardData?.practiceStats?.listening || 0,
    lastScore: parseFloat(dashboardData?.averageScores?.listening) || 0,
  },
  {
    name: 'Writing',
    path: '/writing',
    icon: '⛰️',
    desc: 'Mountain of Mastery',
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'from-blue-50 to-cyan-50',
    progress: dashboardData?.practiceStats?.writing || 0,
    lastScore: parseFloat(dashboardData?.averageScores?.writing) || 0,
  },
  {
    name: 'Reading',
    path: '/reading',
    icon: '📚',
    desc: 'Library of Knowledge',
    color: 'from-orange-400 to-red-400',
    bgColor: 'from-orange-50 to-red-50',
    progress: dashboardData?.practiceStats?.reading || 0,
    lastScore: parseFloat(dashboardData?.averageScores?.reading) || 0,
  },
];

// Removed achievements array

const getRecentActivity = (dashboardData) => {
  if (!dashboardData?.recentActivities) return [];

  return dashboardData.recentActivities.map((activity) => ({
    type: activity.practiceType || activity.type,
    action: activity.type === 'practice' ? 'Completed practice' : 'Activity',
    score: activity.score || 0,
    time: new Date(activity.timestamp).toLocaleDateString(),
  }));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    const loadDashboardData = () => {
      const data = getDashboardData();
      const userData = getUser();
      setDashboardData(data);
      setUser(userData);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const totalXP = 100; // XP needed for next level

  const xpPercent = (currentXP / totalXP) * 100;

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleGenerateStudyPlan = async () => {
    setGeneratingPlan(true);
    try {
      const plan = await generateStudyPlan(user);
      if (plan) {
        setUser({ ...user, studyPlan: plan });
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to continue your IELTS journey?
          </p>
          <button
            onClick={resetData}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            Reset Data (Testing)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            {user?.studyPlan ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📋 Your Study Plan
                  </h2>
                  <div className="text-sm text-gray-600">
                    {user.studyPlan.weeks} weeks
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-700 font-medium">
                    {user.studyPlan.summary}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Focus Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.studyPlan.focus_areas?.map((area, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold text-gray-800">
                          {area.skill}
                        </div>
                        <div className="text-sm text-gray-600">
                          {area.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    This Week's Focus
                  </h3>
                  {user.studyPlan.weekly_schedule
                    ?.slice(0, 2)
                    .map((week, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Week {week.week}: {week.focus}
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {week.tasks?.slice(0, 3).map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <span className="text-blue-500">•</span>
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Create Your Study Plan
                </h2>
                <p className="text-gray-600 mb-6">
                  Get a personalized study plan based on your current level and
                  target score
                </p>
                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={generatingPlan}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPlan ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating Plan...
                    </div>
                  ) : (
                    'Generate Study Plan'
                  )}
                </button>
              </div>
            )}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {getRecentActivity(dashboardData).map((activity, index) => (
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
                {getSkillsData(dashboardData).map((skill, index) => (
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
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {user?.studyPlan && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📝 Study Recommendations
                </h2>
                <div className="space-y-3">
                  {user.studyPlan.recommendations?.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100"
                      >
                        <div className="text-blue-500 text-lg">💡</div>
                        <div className="text-sm text-gray-700">
                          {recommendation}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
