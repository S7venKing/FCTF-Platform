import { saveAs } from "file-saver";
import React, { useEffect, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { FiAlertCircle, FiCheck, FiClock } from "react-icons/fi";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  API_CHALLEGE_START,
  API_CHALLENGE_STOP,
  APi_GET_CHALLENGES_HINTS,
  API_UNLOCK_HINTS,
  API_USER_PROFILE,
  BASE_URL,
  GET_CHALLENGE_DETAILS,
  SUBMIT_FLAG,
  API_ACTION_LOGS,
} from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";
import { actionType } from "../../constants/ActionLogConstant";
const ChallengeDetail = () => {
  const { id } = useParams();
  const challengeId = id ? parseInt(id, 10) : undefined;
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [isChallengeStarted, setIsChallengeStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [showTimeUpAlert, setShowTimeUpAlert] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const timerRef = useRef(null); // Timer reference to control interval
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [url, setUrl] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeOut, setisTimeOut] = useState(false);
  const [hints, setHints] = useState([]);
  const [unlockHints, setUnlockHints] = useState([]);
  const [hint, setHint] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isFetchDetailSuccess, setFetchDetailSuccess] = useState(false);
  const [IsStopping, setIsStopping] = useState(false);
  const [message, setMessage] = useState(null);
  const descriptionRef = useRef(null);

  const handleRadioChange = (event) => {
    if (event.target.name === "radio-group") {
      console.log(event.target.value);
      setAnswer(event.target.value);
    }
  };
  const logUserAction = async (actionType, actionDetail, challenge_id) => {
    const api = new ApiHelper(BASE_URL);
    try {
      const response = await api.post(`${API_ACTION_LOGS}`, {
        actionType: actionType,
        actionDetail: actionDetail,
        challenge_id: challengeId,
      });
      return response;
    } catch (error) {
      console.error("Error logging user action:", error);
    }
  };

  useEffect(() => {
    const container = descriptionRef.current;
    if (isFetchDetailSuccess) {
      // Gắn sự kiện `change` vào container
      if (container) {
        container.addEventListener("change", handleRadioChange);
      }
    }
    // Dọn dẹp sự kiện khi component bị unmount
    return () => {
      if (container) {
        container.removeEventListener("change", handleRadioChange);
      }
    };
  }, [isFetchDetailSuccess]);

  const fetchHints = async () => {
    const api = new ApiHelper(BASE_URL);
    try {
      const response = await api.get(
        `${APi_GET_CHALLENGES_HINTS}/${challengeId}/all`
      );
      if (response.hints) {
        const fetchedHintData = response.hints.hints;
        setHints(fetchedHintData || []);
      } else {
        console.error(
          "Failed to fetch hints:",
          response.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching hints:", error);
    }
  };

  useEffect(() => {
    fetchHints();
  }, [challengeId]);

  const FetchHintDetails = async (hintId) => {
    try {
      const api = new ApiHelper(BASE_URL);
      const response = await api.get(`${APi_GET_CHALLENGES_HINTS}/${hintId}`);
      if (response.success) {
        const hintDetails = response.data;
        setHint(hintDetails || []);
        return response;
      } else {
        console.error(
          "Failed to fetch hints:",
          response.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching hints:", error);
    }
  };

  const getFileName = (filePath) => {
    const pathParts = filePath.split("/");
    const fullName = pathParts[pathParts.length - 1];
    return fullName.split("?")[0];
  };

  const handleDowloadFiles = async (filePath) => {
    const api = new ApiHelper(BASE_URL);
    try {
      const response = await api.get(`${BASE_URL}${filePath}`);
      let fileName = getFileName(filePath);
      saveAs(`${BASE_URL}${filePath}`, fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  //SUA MODAL O DAY
  const Modal = ({ isOpen, message, title, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-7 rounded-lg shadow-xl max-w-xl w-1/2 sm:max-w-full">
          <h2 className="text-2xl mb-3">
            <b>{title}</b>
          </h2>
          <p className="text-lg mb-4">{message}</p>
          <div className="flex flex-col items-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-theme-color-primary text-white rounded-lg hover:bg-theme-color-primary-dark"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HintUnlocks = async (hintId) => {
    const api = new ApiHelper(BASE_URL);
    try {
      const response = await api.post(`${API_UNLOCK_HINTS}`, {
        type: "hints",
        target: hintId,
      });
      if (response.success) {
        setUnlockHints((prev) => [...prev, hintId]);
        logUserAction(actionType.UNLOCK_HINT, "Mở khóa trợ giúp cho thử thách " + challenge.name);
      }
      return response;
    } catch (error) {
      console.error("Failed to unlock hint:", error);
      return { success: false, errors: error.response?.data?.errors || {} };
    }
  };
  //CLICK UNLOCK TAIN DAYYYYYYYYYYYYYYYYYYYYYYYYY
  const handleUnlockHintClick = async (hintId, hintCost) => {
    try {
      const api = new ApiHelper(BASE_URL);
      const teamResponse = await api.get(`${API_USER_PROFILE}`);
      const teamName = teamResponse?.data?.team;
      if (!teamName) {
        Swal.fire({
          title: "Error!",
          text: "Unable to identify the current team. Please log in again.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      var unlockedHints = false;
      const hintDetailsResponse = await FetchHintDetails(hintId);
      if (!hintDetailsResponse?.data) {
        Swal.fire({
          title: "Hint Details",
          text: `Failed to fetch hint data"}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      if (hintDetailsResponse?.data.content) {
        unlockedHints = true;
      }

      // Check if the hint ID is marked as unlocked
      if (unlockedHints == true) {
        console.log("hehe");
        // Fetch the hint details directly from the server
        Swal.fire({
          title: "Hint Details",
          text: `Details: ${hintDetailsResponse.data.content || "No content available."
            }`,
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }

      if (unlockedHints == false) {
        // Show SweetAlert confirmation before proceeding
        const result = await Swal.fire({
          title: "Are you sure?",
          text: `Do you want to unlock this hint with a cost of ${hintCost} points?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, unlock it!",
          cancelButtonText: "No, cancel",
          reverseButtons: true, // This makes the "No, cancel" button appear on the left
        });
        // If user confirms, proceed with unlocking the hint
        if (result.isConfirmed) {
          // Call the unlock API
          const response = await HintUnlocks(hintId);
          if (response?.success) {
            const hintDetailsResponse = await FetchHintDetails(hintId);
            // If the hint was unlocked successfully, fetch and show the details
            if (hintDetailsResponse?.data) {
              // Show success with hint details using SweetAlert
              Swal.fire({
                title: "Unlock Success!",
                text: `Hint unlocked! Details: ${hintDetailsResponse.data.content || "No content available."
                  }`,
                icon: "success",
                confirmButtonText: "OK",
              });
            } else {
              // Show message when hint is unlocked but no details are available
              Swal.fire({
                title: "Unlock Success!",
                text: "Hint unlocked, but no details available.",
                icon: "info",
                confirmButtonText: "OK",
              });
            }
          } else {
            // Handle errors based on the response
            if (response.errors?.score) {
              const errorMessage = response.errors.score;
              Swal.fire({
                title: "Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
              });
            } else if (response.errors?.target) {
              // Check if the error message indicates that the target is already unlocked
              const errorMessage = response.errors.target;
              console.log(errorMessage);
              if (errorMessage === "You've already unlocked this this target") {
                const hintDetailsResponse = await FetchHintDetails(hintId);
                if (hintDetailsResponse?.data) {
                  Swal.fire({
                    title: "Already Unlocked",
                    text: `You've already unlocked this hint. Details: ${hintDetailsResponse.data.content ||
                      "No content available."
                      }`,
                    icon: "info",
                    confirmButtonText: "OK",
                  });
                } else {
                  Swal.fire({
                    title: "Already Unlocked",
                    text: "You've already unlocked this hint, but no details are available.",
                    icon: "info",
                    confirmButtonText: "OK",
                  });
                }
              } else {
                // Show the target error message if it's something else
                Swal.fire({
                  title: "Error!",
                  text: errorMessage,
                  icon: "error",
                  confirmButtonText: "OK",
                });
              }
            } else {
              // Default error message for other cases
              Swal.fire({
                title: "Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
              });
            }
          }
        } else {
          // If the user cancels, show a cancellation message (optional)
          Swal.fire({
            title: "Cancelled",
            text: "Unlocking the hint was cancelled.",
            icon: "info",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (error) {
      // Handle unexpected errors
      Swal.fire({
        title: "Error!",
        text: "An error occurred while processing your request.",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error in handleUnlockHintClick:", error);
    } finally {
      // Ensure the modal opens with the appropriate message
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    setFetchDetailSuccess(false);
    const api = new ApiHelper(BASE_URL);
    try {
      const detailsResponse = await api.get(`${GET_CHALLENGE_DETAILS}/${id}`);
      if (!detailsResponse.data) {
        console.error("No data returned from challenge details API.");
        return;
      }
      const data = detailsResponse.data;
      logUserAction(
        actionType.ACCESS_CHALLENGE,
        "Tiếp cận thử thách " + data.name
      );
      setChallenge(data);
      setIsSubmitted(data.solve_by_myteam);
      if (data.time_limit !== -1) {
        setTimeLimit(data.time_limit * 60 || null);
        setTimeRemaining(detailsResponse.time_remaining);
        if (detailsResponse.time_remaining > 0) {
          setUrl(detailsResponse.challenge_url || null);
          setIsChallengeStarted(detailsResponse.is_started || false);
          if (detailsResponse.is_started) {
            setUrl(detailsResponse.challenge_url || null);
            setMessage(
              detailsResponse.message ||
              "Challenge started by other member in your team. "
            );
          }
        } else {
          setUrl(null);
          setIsChallengeStarted(false);
        }
      } else {
        setTimeLimit(null);
        if (detailsResponse.time_remaining == 0) {
          setUrl(detailsResponse.challenge_url || null);
          setIsChallengeStarted(detailsResponse.is_started || false);
          if (detailsResponse.is_started) {
            setUrl(detailsResponse.challenge_url || null);
            setMessage(
              detailsResponse.message ||
              "Challenge started by other member in your team. "
            );
          }
        }
      }
      setFetchDetailSuccess(true);
      return detailsResponse.time_remaining;
    } catch (err) {
      console.error("Error fetching challenge details:", err.message || err);
    }
  };

  useEffect(() => {
    if (isChallengeStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [isChallengeStarted, timeRemaining]);

  const handleStartChallenge = async () => {
    if (!challengeId) {
      Swal.fire({
        title: "Error!",
        text: "Invalid challenge ID",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const api = new ApiHelper(BASE_URL);
    const generatedToken = localStorage.getItem("accessToken");
    setIsStarting(true);

    try {
      const response = await api.post(API_CHALLEGE_START, {
        challenge_id: challengeId,
        generatedToken,
      });

      if (response.success) {
        try {
          const timeRemaining = await fetchChallengeDetails();
                      logUserAction(actionType.START_CHALLENGE, ` Khởi động thử thách ${challenge.name}`);
          setUrl(response.challenge_url || null);
          setIsChallengeStarted(true);
          setIsSubmitted(false);

          if (timeRemaining !== null) {
            setTimeRemaining(timeRemaining);
          }

          if (response.challenge_url) {
            const currentSchema = window.location.protocol;
            const challengeUrl = `http://${response.challenge_url}`;

            // Regular expression to check if `challengeUrl` contains a valid domain name
            const isValidUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(
              challengeUrl
            );
            console.log(challengeUrl);
            if (isValidUrl) {
              // Success message with a clickable link
              Swal.fire({
                title: "Challenge Started!",
                html: `Your challenge is now live. Click <a href="${challengeUrl}" target="_blank" style="color: blue; text-decoration: underline;">here</a> to access it.`,
                icon: "success",
                confirmButtonText: "OK",
              });

            } else {
              // Success message with plain text
              Swal.fire({
                title: "Challenge Started!",
                text: `Your challenge is now live. Access information: ${response.challenge_url}`,
                icon: "success",
                confirmButtonText: "OK",
              });
            }
          }
        } catch (detailsError) {
          console.error("Error updating challenge details:", detailsError);
          Swal.fire({
            title: "Error!",
            text: "Failed to fetch challenge details.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }

      } else {
        Swal.fire({
          title: "Error!",
          html: `${response.message ||
            response.error ||
            "An error occurs, please try again later!"
            }`,
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error(
          "Failed to start challenge:",
          response.error || "Unknown error"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        err;
      if (errorMessage.includes("User or TeamId")) {
        Swal.fire({
          title: "Authentication Needed",
          text: "We couldn’t verify your session. Please log in again to continue.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else if (errorMessage.includes("Connection url failed")) {
        Swal.fire({
          title: "Connection Issue",
          text: "We couldn’t connect to the server. Please check your internet connection or try again later.",
          icon: "error",
          confirmButtonText: "Retry",
        });
      } else if (errorMessage.includes("Redis connection failed")) {
        Swal.fire({
          title: "Something Went Wrong",
          text: "We’re having trouble connecting to our servers. Please try again later or contact support if this keeps happening.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error",
          text:
            errorMessage ||
            "Something went wrong on our end. Please refresh the page or try again later.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      console.error("Error starting challenge:", errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopChallenge = async () => {
    const api = new ApiHelper(BASE_URL);
    setIsStopping(true);
    try {
      const response = await api.postForm(API_CHALLENGE_STOP, {
        challenge_id: challengeId,
      });

      if (response.isSuccess) {
        setIsChallengeStarted(false);
        setTimeLeft(null);
        clearInterval(timerRef.current);
        setUrl(null);

        Swal.fire({
          title: "Success!",
          text: "Challenge stopped successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
        
              logUserAction(actionType.STOP_CHALLENGE, `Dừng thử thách ${challenge.name}`);
      } else {
        const errorMessage =
          response.message ||
          response.error ||
          "An error occurred, please try again later!";
        Swal.fire({
          title: "Oops!",
          text: errorMessage.includes(
            "Challenge not started or already stopped"
          )
            ? "This challenge is not currently active or has already been stopped."
            : errorMessage,
          icon: "error",
          confirmButtonText: "Try Again",
        });
        console.error("Failed to stop challenge:", errorMessage);
      }

    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        err;
      if (errorMessage.includes("ChallengeId is required")) {
        Swal.fire({
          title: "Invalid Request",
          text: "No challenge ID was provided. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else if (errorMessage.includes("Token not found")) {
        Swal.fire({
          title: "Authentication Needed",
          text: "We couldn’t verify your session. Please log in again to continue.",
          icon: "warning",
          confirmButtonText: "Log In",
        });
      } else if (errorMessage.includes("User not found")) {
        Swal.fire({
          title: "User Not Found",
          text: "We couldn’t find your account in our system. Please contact support if the issue persists.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else if (errorMessage.includes("User no join team")) {
        Swal.fire({
          title: "Not in a Team",
          text: "You must join a team to stop this challenge.",
          icon: "info",
          confirmButtonText: "OK",
        });
      } else if (errorMessage.includes("Challenge not found")) {
        Swal.fire({
          title: "Challenge Not Found",
          text: "The challenge you’re trying to stop doesn’t exist. Please verify the challenge ID.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else if (
        errorMessage.includes("Challenge not started or already stopped")
      ) {
        Swal.fire({
          title: "No Active Challenge",
          text: "This challenge has not started or has already been stopped.",
          icon: "info",
          confirmButtonText: "OK",
        });
      } else if (errorMessage.includes("Failed to connect to stop API")) {
        Swal.fire({
          title: "Connection Issue",
          text: "We couldn’t connect to the server to stop the challenge. Please try again later.",
          icon: "error",
          confirmButtonText: "Retry",
        });
      } else {
        Swal.fire({
          title: "Error",
          text:
            errorMessage ||
            "Something went wrong on our end. Please refresh the page or try again later.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      console.error("Error stopping challenge:", errorMessage);
    } finally {
      setIsStopping(false);
    }
  };

  const handleSubmitFlag = async () => {
    setIsSubmittingFlag(true);
    setSubmissionError(null);
    const api = new ApiHelper(BASE_URL);

    try {
      const data = {
        challengeId: challengeId,
        submission: answer,
        generatedToken: localStorage.getItem("accessToken"),
      };
      const response = await api.postForm(SUBMIT_FLAG, data);
      if (response?.data.status === "correct") {
                    logUserAction(
          actionType.CORRECT_FLAG,
          `Nộp cờ đúng cho thử thách ${challenge.name}`
        );
        // Success message for correct flag
        Swal.fire({
          title: "Correct Flag!",
          text: response.data.message || "You have solved the challenge!",
          icon: "success",
          confirmButtonText: "OK",
        });
        setIsSubmitted(true);
        setTimeRemaining(null);

      } else if (response?.data.status === "already_solved") {
        // Information message for already solved
        Swal.fire({
          title: "Already Solved!",
          text:
            response.data.message || "This challenge has already been solved.",
          icon: "info",
          confirmButtonText: "OK",
        });
      } else if (response?.data.status === "ratelimited") {
        // Warning message for rate-limited submissions
        Swal.fire({
          title: "Rate Limit Exceeded!",
          text:
            response.data.message ||
            "You have exceeded the submission rate limit.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else if (response?.status_code) {
        // Error message for no attempts left
        Swal.fire({
          title: "No Attempts Left!",
          text: "Your team has zero attempts left for this challenge.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        // Error message for incorrect flag
        Swal.fire({
          title: "Incorrect Flag!",
          text: response?.data?.message || "The flag you entered is incorrect.",
          icon: "error",
          confirmButtonText: "OK",
        });
        setSubmissionError(response?.data.message || "Incorrect flag");
        logUserAction(actionType.INCORRECT_FLAG, `Nộp cờ sai cho thử thách ${challenge.name}`);
      }
      

    } catch (error) {
      Swal.fire({
        title: "No Submission Left!",
        text:
          error.response?.data.message ||
          "Error submitting flag. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error submitting flag:", error);
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const formatTime = (seconds) => {
    if (challenge?.time_limit === -1) return "Unlimited";
    if (seconds === null || !challenge?.require_deploy) return "--:--";
    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = remainingSecondsAfterHours % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("Please enter your answer");
      return;
    }
    setIsSubmitted(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-theme-color-base p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="lg:flex">
          <div className="lg:w-[70%] p-8 bg-white">
            <h1
              className="text-3xl font-bold text-theme-color-primary mb-6"
              role="heading"
            >
              {challenge ? challenge.name : "..."}
            </h1>
            <div className="prose max-w-none">
              {challenge ? (
                <>
                  <h1 className="text-theme-color-neutral-content text-lg mb-2">
                    <b>Max attempts</b>:{" "}
                    {challenge.max_attempts > 0
                      ? challenge.max_attempts + " times"
                      : "UNLIMITED"}{" "}
                    <br />
                    <b>Submitted</b>: {challenge.attemps} times
                    <br />
                    <b>Type</b>: {challenge.type}
                    <br />
                    <br />
                  </h1>
                  <div className="bg-neutral-low rounded-md">
                    <div className="bg-white rounded-md overflow-y-auto max-h-96">
                      {challenge.type === "multiple_choice" && (
                        <pre className="bg-white rounded-md whitespace-pre-wrap break-words font-sans">
                          {challenge.type === "multiple_choice" ? (
                            <div
                              ref={descriptionRef}
                              dangerouslySetInnerHTML={{
                                __html: challenge.description,
                              }}
                            />
                          ) : (
                            <div>{challenge.description}</div>
                          )}
                        </pre>
                      )}
                      {challenge.type !== "multiple_choice" && (
                        <pre className="bg-white rounded-md whitespace-pre-wrap break-words font-sans">
                          {challenge.type === "multiple_choice" ? (
                            <div
                              ref={descriptionRef}
                              dangerouslySetInnerHTML={{
                                __html: challenge.description,
                              }}
                            />
                          ) : (
                            <div>{challenge.description}</div>
                          )}
                        </pre>
                      )}

                      {challenge.files && (
                        <div>
                          <div className="flex flex-wrap gap-4">
                            {challenge.files.map((file, index) => (
                              <button
                                key={index}
                                onClick={() => handleDowloadFiles(file)}
                                className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <FaDownload className="mr-2" />
                                {getFileName(file)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {url && (
                        <pre className="bg-white rounded-md whitespace-pre-wrap break-words font-sans">
                          {message} <br></br>
                          Your connection info is: {url}
                        </pre>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading challenge details...</p>
              )}
            </div>
          </div>

          <div className="lg:w-[30%] bg-theme-color-base p-8">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 text-2xl font-mono bg-white p-4 rounded-lg shadow-md">
                <FiClock className="text-theme-color-primary" />
                {!isChallengeStarted && (
                  <span className="font-bold">{formatTime(timeLimit)}</span>
                )}
                {isChallengeStarted && (
                  <span className="font-bold">{formatTime(timeRemaining)}</span>
                )}
              </div>
            </div>
            {showTimeUpAlert && (
              <div className="bg-theme-color-primary-dark text-white p-4 rounded-lg mb-6 flex items-center justify-center">
                <FiAlertCircle className="mr-2" />
                <span>Time is up!</span>
              </div>
            )}
            {/* Updated Hints Section */}
            <div className="space-y-2 mb-4">
              {hints.length > 0 && (
                <h3 className="font-medium text-theme-color-neutral-content mb-3">
                  Available Hints:
                </h3>
              )}
              <div className="grid grid-cols-3 gap-2">
                {hints.map((hint) => (
                  <div key={hint.id}>
                    <button
                      type="button"
                      className="w-full h-16 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300  items-center justify-center font-medium text-theme-color-primary hover:bg-gray-5"
                      onClick={() => handleUnlockHintClick(hint.id, hint.cost)}
                    >
                      <div className="text-center">Hint</div>
                      <div className="text-center">{hint.cost} Points</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {challenge?.attemps >= challenge?.max_attempts &&
                challenge?.max_attempts !== 0 &&
                !isSubmitted && (
                  <div className="text-center">
                    <span className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-theme-color-neutral cursor-not-allowed">
                      You have reached the maximum number of submissions
                      allowed.
                    </span>
                  </div>
                )}
              {challenge?.type !== "multiple_choice" &&
                (challenge?.attemps < challenge?.max_attempts ||
                  challenge?.max_attempts == 0) &&
                !isSubmitted && (
                  <div>
                    <label
                      htmlFor="answer"
                      className="block text-theme-color-neutral-content font-medium mb-2"
                    >
                      Your Answer
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-theme-color-primary focus:border-transparent ${error ? "border-red-500" : "border-theme-color-neutral"
                        }`}
                      rows="6"
                      placeholder="Enter your solution here..."
                      disabled={
                        isSubmitted ||
                        (challenge?.require_deploy && !isChallengeStarted)
                      }
                      aria-label="Answer input field"
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                )}
              {(challenge?.attemps <= challenge?.max_attempts ||
                challenge?.max_attempts == 0) && (
                  <button
                    onClick={handleSubmitFlag}
                    type="submit"
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isSubmitted ||
                      (challenge?.require_deploy && !isChallengeStarted)
                      ? "bg-theme-color-neutral cursor-not-allowed"
                      : "bg-theme-color-primary hover:bg-theme-color-primary-dark text-white"
                      }`}
                    disabled={
                      isSubmitted ||
                      (challenge?.require_deploy && !isChallengeStarted) ||
                      isTimeOut
                    }
                  >
                    {isSubmitted ? (
                      <>
                        <FiCheck className="text-white" />
                        <span>This challenge have solved</span>
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </button>
                )}
              <Modal
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={() => setIsModalOpen(false)}
              />
              {/* Nút Start Challenge chỉ hiển thị nếu require_deploy là true */}
              {challenge?.require_deploy &&
                !isChallengeStarted &&
                !isSubmitted && (
                  <button
                    type="button"
                    onClick={handleStartChallenge}
                    disabled={isStarting} // Disable button while starting
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isStarting
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    {isStarting ? "Starting..." : "Start Challenge"}
                  </button>
                )}
              {/* Display the Stop Challenge button if the challenge is started and require_deploy is true */}
              {isChallengeStarted &&
                challenge?.require_deploy &&
                !isSubmitted && (
                  <button
                    type="button"
                    onClick={handleStopChallenge}
                    disabled={IsStopping} // Disable the button during API call
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${IsStopping
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                  >
                    {IsStopping ? (
                      <span className="flex items-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        <span>Stopping...</span>
                      </span>
                    ) : (
                      "Stop Challenge"
                    )}
                  </button>
                )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
