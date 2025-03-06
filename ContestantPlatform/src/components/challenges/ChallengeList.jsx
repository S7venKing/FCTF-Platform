import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { API_GET_DATE_CONFIG, BASE_URL, GET_CHALLENGE_LIST_PATH } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const ChallengeList = () => {
    const { categoryName } = useParams(); // Lấy `abcxyz` từ URL, đặt tên là `category`
    const [challenges, setChallenges] = useState([]);
    const [error, setError] = useState(false);
    const [statusMessage, setStatusMessage]= useState(null)
    const [isContestActive, setIsContestActive]= useState(false)
    useEffect(() => {
        const fetchChallenge = async () => {
            const api = new ApiHelper(BASE_URL);
            try {
                const response = await api.get(GET_CHALLENGE_LIST_PATH + encodeURIComponent(categoryName));
                setChallenges(response.data);
                setError(false);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(true);
            }
        };

        fetchChallenge();
    }, []);

    useEffect(() => {
        const fetchDateConfig = async () => {
            const api = new ApiHelper(BASE_URL);
            try {
                const response = await api.get(`${API_GET_DATE_CONFIG}`);
                if (response.isSuccess) {
                    const { message, start_date, end_date } = response;

                    if (message === "CTFd has not been started" && start_date) {
                        const startDate = new Date(start_date * 1000);
                        if (new Date() < startDate) {
                            setStatusMessage("Contest is starting soon!");
                            setIsContestActive(false);
                        }
                    } else if (message === "CTFd has been started" && end_date) {
                        const endDate = new Date(end_date * 1000);
                        if (new Date() < endDate) {
                            setIsContestActive(true);
                            setStatusMessage("The contest is ongoing!");
                        }
                    } else {
                        setStatusMessage("The contest has ended.");
                        setIsContestActive(false);
                    }
                } else {
                    setStatusMessage("Error fetching contest details.");
                }
            } catch (error) {
                setStatusMessage("Error connecting to the server.");
                console.error("Fetch error:", error);
            }
        };

        fetchDateConfig();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-bold text-center mb-4 text-[#f17226]" role="heading">
                Topic: {categoryName}
            </h2>
            <div className="text-center mb-4 text-theme-color-neutral-dark">
                {statusMessage}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-items-center">
                {challenges.map((challenge) => (
                    isContestActive ? (
                        <Link
                            to={`/challenge/${challenge.id}`}
                            key={challenge.id}
                            className="bg-white w-full max-w-sm rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out p-6 cursor-pointer"
                        >
                            <div className="flex flex-col text-center space-y-3">
                                <h3 className="text-xl font-bold text-theme-color-primary-content">
                                    {challenge.name}
                                </h3>
                                <p className="text-theme-color-neutral text-left">
                                    <b>Limit Time:</b> {challenge.time_limit > 0 ? challenge.time_limit + " minutes" : "UNLIMITED"}
                                </p>
                                <p className="text-theme-color-neutral text-left">
                                    <b>Max attempts:</b> {challenge.max_attempts == 0? "UNLIMITED" : challenge.max_attempts}
                                </p>
                                <p className="text-theme-color-neutral text-left">
                                    <b>Points:</b> {challenge.value}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <div
                            key={challenge.id}
                            className="bg-gray-200 w-full max-w-sm rounded-lg shadow-md p-6 opacity-50 cursor-not-allowed"
                        >
                            <div className="flex flex-col text-center space-y-3">
                                <h3 className="text-xl font-bold text-gray-500">
                                    {challenge.name}
                                </h3>
                                <p className="text-gray-500 text-left">
                                    <b>Limit Time:</b> {challenge.time_limit ? challenge.time_limit + " minutes" : "None"}
                                </p>
                                <p className="text-gray-500 text-left">
                                    <b>Max attempts:</b> {challenge.max_attempts}
                                </p>
                                <p className="text-gray-500 text-left">
                                    <b>Points:</b> {challenge.value}
                                </p>
                            </div>
                        </div>
                    )
                ))}
            </div>
            {error && (
                <div className="mt-4 text-center text-theme-color-neutral-dark">
                    Unable to fetch categories. Showing sample data.
                </div>
            )}
        </div>
    );
};

export default ChallengeList;