import React, { useEffect, useState } from "react";
import { FaLock, FaMedal, FaTrophy, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
import { API_TEAM_PERFORMANCE, API_TEAM_POINT, API_USER_PROFILE, BASE_URL } from "../../constants/ApiConstant";
import { ACCESS_TOKEN_KEY } from "../../constants/LocalStorageKey";
import ApiHelper from "../../utils/ApiHelper";
import PerformanceChart from "./PerformanceChart";

const UserProfile = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [teamPointInfo, setTeamPointInfo] = useState({
        members: []
    });
    const [teamPerformance, setTeamPerformance] = useState({
        data: []
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [finishPercent, setFinishPercent] = useState(75);

    const [passwordStrength, setPasswordStrength] = useState("");
    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const validatePassword = (password) => {
        const criteria = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        setPasswordCriteria(criteria);

        const strength =
            Object.values(criteria).filter(Boolean).length >= 4
                ? "Strong"
                : "Weak";
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));

        if (name === "newPassword") {
            validatePassword(value);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchTeamPointInfo();
        fetchPerformaceData();
    }, [])

    let fetchUserInfo = async () => {
        const api = new ApiHelper(BASE_URL);
        try {
            const response = await api.get(`${API_USER_PROFILE}`);
            console.log(response)
            if (response.data) {
                setUserInfo(response.data);
            } else {
                console.error("Failed to fetch hints:", response.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching UserInfo:", error);
        }
    }

    let fetchTeamPointInfo = async () => {
        const api = new ApiHelper(BASE_URL);
        try {
            const response = await api.get(`${API_TEAM_POINT}`);
            if (response.data) {
                setTeamPointInfo(response.data);
                setFinishPercent((response.data.score / response.data.challengeTotalScore * 100).toFixed(2));
            } else {
                console.error("Failed to fetch hints:", response.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching TeamPointInfo:", error);
        }
    }

    let fetchPerformaceData = async () => {
        const api = new ApiHelper(BASE_URL);
        try {
            const response = await api.get(`${API_TEAM_PERFORMANCE}`);
            console.log(response);
            if (response.data) {
                setTeamPerformance(response)
            } else {
                console.error("Failed to fetch hints:", response.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching TeamPointInfo:", error);
        }
    }

    const achievements = [
        { id: 1, title: "First Blood", description: "First to solve a challenge", type: "gold" },
        { id: 2, title: "Speed Demon", description: "Completed 5 challenges in 1 hour", type: "silver" },
        { id: 3, title: "Master Hacker", description: "Solved all web challenges", type: "bronze" },
        { id: 4, title: "Master Hacker", description: "Solved all web challenges", type: "bronze" },
        { id: 5, title: "Master Hacker", description: "Solved all web challenges", type: "bronze" },
        { id: 6, title: "Master Hacker", description: "Solved all web challenges", type: "bronze" }
    ];

    const recentChallenges = [
        { name: "Web Exploit 101", difficulty: "Easy", completed: true, progress: 100 },
        { name: "Binary Analysis", difficulty: "Hard", completed: false, progress: 75 },
        { name: "Cryptography Challenge", difficulty: "Medium", completed: true, progress: 100 }
    ];
    const handleChangePassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = passwordData;
        const generatedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const api = new ApiHelper(BASE_URL);
        // Basic validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            showModalMessage("All fields are required!", "error");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            showModalMessage("New password and confirm password do not match!", "error");
            return;
        }
    
        if (newPassword.length < 8) {
            showModalMessage("New password must be at least 8 characters long.", "error");
            return;
        }
    
        try {
            const response = await api.patch(`${API_USER_PROFILE}`, {
                params: {
                    password: newPassword,
                    confirm: oldPassword,
                },
            });
        
            if (response.success) {
                showModalMessage("Password updated successfully!", "success");
                setShowPasswordModal(false);
            } else {
                showModalMessage(response.errors || "Unexpected error occurred.", "error");
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                console.log(status, data)
                if (status === 400 && data && data.errors) {
                    switch (data.errors) {
                        case "Both 'password' and 'confirm' fields are required.":
                            showModalMessage("Please provide both current and new passwords.", "error");
                            break;
                            case "Password does not meet the required criteria.":
                                showModalMessage(
                                    "Your new password doesn't match the required criteria. " +
                                    "It must contain at least one letter (uppercase or lowercase), " +
                                    "at least one digit, at least one special character (@$!%*#?&), " +
                                    "and be at least 8 characters long.",
                                    "error"
                                );
                                break;
                        case "Password and confirm must not be the same.":
                            showModalMessage("Password and old password must not be the same.", "error");
                            break;
                        case "Authentication failed.":
                            showModalMessage("Authentication failed. Please log in again.", "error");
                            break;
                        default:
                            showModalMessage(data.errors.confirm || "An unexpected error occurred.", "error");
                    }
                } else {
                    showModalMessage("An unexpected error occurred. Please try again.", "error");
                }
            } else {
                showModalMessage("A network error occurred. Please check your connection.", "error");
            }
        }
    };
    
    // Utility function to display SweetAlert2 modal messages
    const showModalMessage = (message, icon = "info") => {
        Swal.fire({
            title: icon === "success" ? "Success!" : "Error!",
            text: message,
            icon: icon,
            confirmButtonText: "OK",
        });
    };

    return (
        <div className="min-h-screen p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
                    <div>
                        <div className="flex items-center justify-center">
                            <div className="relative w-[125px] h-[125px] overflow-hidden rounded-full group ring-1 transition-all mb-3">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcwhPhFEnyOzxoKysVzNiMn245tFGSEBFavA&s"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{userInfo.username}</h2>
                                <p className="text-gray-600">{userInfo.team}</p>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center text-theme-color-primary hover:text-theme-color-primary-dark"
                                >
                                    <div className="flex items-center space-x-1">
                                        <FaLock />
                                        <span className="">Change Password</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Ranking Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Team Ranking</h2>
                        <FaTrophy className="text-yellow-500 text-2xl" />
                    </div>
                    <div className="text-5xl font-bold text-theme-color-primary mb-3">{teamPointInfo.place}</div>
                    <p className="text-gray-600">Team Score: {teamPointInfo.score}</p>
                    <div className="p-3">
                        <div className="mt-4 bg-gray-200 rounded-full h-2 relative">
                            <div
                                className="bg-theme-color-primary h-2 rounded-full"
                                style={{ width: `${finishPercent}%` }}
                            ></div>
                            <span
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-sm text-gray-700 font-medium"
                            >
                                Finished: {finishPercent}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Performance Chart Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Team Performance</h2>
                    <div className="max-h-[185px] flex items-center justify-center">
                        <PerformanceChart data={teamPerformance.data} />
                    </div>
                </div>

                {/* Team Members Table */}
                <div className="bg-white rounded-lg shadow p-6 col-span-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Team Members</h2>
                        <FaUsers className="text-theme-color-primary text-2xl" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-primary rounded-lg overflow-hidden divide-y divide-primary">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Email</th>
                                    <th className="p-4 text-left">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamPointInfo.members.map((member, index) => (
                                    <tr key={index} className="border-t border-primary">
                                        <td className="p-4">{member.name}</td>
                                        <td className="p-4">{member.email}</td>
                                        <td className="p-4">{member.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
                    {/* Achievements Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Achievements</h2>
                        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2">
                            {achievements.map((achievement) => (
                                <div key={achievement.id} className="flex items-center space-x-3">
                                    <FaMedal className={`text-2xl ${achievement.type === "gold" ? "text-yellow-500" : achievement.type === "silver" ? "text-gray-400" : "text-yellow-700"}`} />
                                    <div>
                                        <h3 className="font-semibold">{achievement.title}</h3>
                                        <p className="text-sm text-gray-600">{achievement.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Challenges Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Challenges</h2>
                        <div className="space-y-4">
                            {teamPerformance.data.map((challenge, index) => (
                                <div key={index} className="border-b pb-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">{challenge.challenge.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs ${challenge.type === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {challenge.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${challenge.type === "correct" ? "bg-green-500" : "bg-theme-color-primary"}`}
                                            style={{ width: `${challenge.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Change Password</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-theme-color-primary text-white rounded-md hover:bg-theme-color-primary-dark"
                                    onClick={() => {
                                        handleChangePassword()
                                        // Handle password change logic here
                                        setShowPasswordModal(false);
                                    }}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;