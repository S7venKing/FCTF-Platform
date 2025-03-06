import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_CREATE_NEW_TEAM, BASE_URL } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const CreateTeamComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: "",
    teamPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const api= new ApiHelper(BASE_URL)
      const response = await api.post(API_CREATE_NEW_TEAM, formData, {
        validateStatus: (status) => status < 500 // Accept all statuses below 500
      });
      if (response.success) {
        Swal.fire({
          title: "Team Created!",
          text: "You have successfully created a team.",
          icon: "success",
          confirmButtonText: "Go to Home Page",
        }).then(() => {
          navigate("/");
        });
      } else {
        Swal.fire({
          title: "Create Team Failed!",
          text: response.data.errors|| response.data.message|| response.data.msg || "Unexpected error occurred. Please try again!",
          icon: "error",
          confirmButtonText: "GOT IT!"
        });
      }
    } catch (error) {
      console.log(error.response.data.message)
      Swal.fire({
        title: "Create Team Failed!",
        text: error.response.data.message || error.response.data.errors|| error.response.data.msg || "Unexpected error occurred. Please try again!",
        icon: "error",
        confirmButtonText: "GOT IT!"
      });
      console.error("Error joining team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Create New Team
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700"
            >
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="teamPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Team Password
            </label>
            <input
              type="password"
              id="teamPassword"
              name="teamPassword"
              value={formData.teamPassword}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Joining...
              </>
            ) : (
              "Join Team"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamComponent;