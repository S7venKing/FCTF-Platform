import React, { useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { API_SCOREBOARD_TOP_STANDINGS, BASE_URL } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const Scoreboard = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTeam, setExpandedTeam] = useState(null); // Tracks which team is expanded
  
    useEffect(() => {
      const fetchTeams = async () => {
        try {
          const api = new ApiHelper(BASE_URL);
          const response = await api.get(`${API_SCOREBOARD_TOP_STANDINGS}`);
          if (!response.success) {
            throw new Error("Failed to fetch teams");
          }
          setTeams(response.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchTeams();
    }, []);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
  
    const highestScore = Math.max(...teams.map((team) => team.score));
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-color-base to-theme-color-base-dark p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl md:text-4xl font-bold text-theme-color-primary mb-8 text-center"
            role="heading"
            aria-level="1"
          >
            Tournament Scoreboard
          </h1>
  
          <div className="grid gap-4">
            {teams.map((team) => (
              <div
                key={team.account_id}
                className={`bg-white rounded-lg p-4 shadow-md transform transition-all duration-300 ease-in-out ${
                  team.score === highestScore ? "border-2 border-theme-color-primary" : ""
                }`}
                role="article"
                aria-label={`${team.name} score card`}
                tabIndex="0"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedTeam((prev) => (prev === team.account_id ? null : team.account_id))
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h2 className="text-xl font-semibold text-theme-color-neutral-content">
                        {team.name}
                      </h2>
                      {team.score === highestScore && (
                        <div className="flex items-center text-theme-color-primary mt-1">
                          <FaTrophy className="mr-1" />
                          <span className="text-sm">Leading</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-theme-color-base">{team.score}</div>
                </div>
  
                {/* Expandable section for team members */}
                {expandedTeam === team.account_id && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-theme-color-primary mb-2">
                      Team Members:
                    </h3>
                    <ul className="space-y-2">
                      {team.members.map((member) => (
                        <li
                          key={member.id}
                          className="flex justify-between bg-gray-100 p-2 rounded-lg shadow-sm"
                        >
                          <span className="text-theme-color-neutral-content">{member.name}</span>
                          <span className="text-theme-color-primary font-bold">{member.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default Scoreboard;