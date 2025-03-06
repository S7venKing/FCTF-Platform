import { useEffect, useState } from "react";
import { API_ACTION_LOGS, BASE_URL } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const ActionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    const api = new ApiHelper(BASE_URL);
    setLoading(true);
    setError(null); // Reset error state before fetching

    try {
      const response = await api.get(`${API_ACTION_LOGS}`);
      if (response.data) {
        setLogs(response.data || []);
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Ensure loading is false after fetch
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Action Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{JSON.stringify(log)}</li>
        ))}
      </ul>
    </div>
  );
};
export default ActionLogs;
