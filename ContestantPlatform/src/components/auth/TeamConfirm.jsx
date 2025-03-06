import React from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_KEY } from "../../constants/LocalStorageKey";

const TeamComponent = () => {
    const navigate= useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome to F-CTF
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/team-join')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Join a Team
          </button>
          <button
            onClick={() => navigate('/team-create')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Create a New Team
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(ACCESS_TOKEN_KEY)
              navigate('/login')
            }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Back to Login Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamComponent;