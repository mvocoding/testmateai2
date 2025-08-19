import React from 'react';

const SubmitStatus = ({ submitting, submitProg, totalTasks }) => {
  if (!submitting) return null;
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
      <p className="text-gray-700 font-medium mb-2">Analyzing your answers...</p>
      <p className="text-sm text-gray-500">{submitProg}/{totalTasks} tasks completed</p>
    </div>
  );
};

export default SubmitStatus;


