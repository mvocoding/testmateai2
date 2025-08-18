import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

export const AskMeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/ask-me') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => navigate('/ask-me')}
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <Icon name="chat" className="w-6 h-6" />
          <span className="font-semibold">Ask AI</span>
        </div>
      </button>
    </div>
  );
};
