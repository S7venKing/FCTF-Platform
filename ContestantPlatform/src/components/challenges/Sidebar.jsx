import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { LuComputer } from "react-icons/lu";
import { API_CHALLENGE_GET_TOPICS, BASE_URL, GET_CHALLENGE_LIST_PATH } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const Sidebar = ({ isOpen, toggleOpen }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [topics, setTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState(topics);
    const searchTimeout = useRef(null);
  
    const handleSearch = (value) => {
      setSearchQuery(value);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
  
      searchTimeout.current = setTimeout(() => {
        const filtered = topics.filter((topic) =>
          topic.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredTopics(filtered);
      }, 1000);
    };
  
    useEffect(() => {
      return () => {
        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
      };
    }, []);
  
    useEffect(() => {
      const fetchListTopics = async () => {
        const api = new ApiHelper(BASE_URL);
        try {
          const response = await api.get(API_CHALLENGE_GET_TOPICS);
          setTopics(response.data);
          setFilteredTopics(response.data);
        } catch (error) {
          console.log(error, "Error fetching topics");
        }
      };
  
      if (isOpen) {
        fetchListTopics();
      }
    }, [isOpen]);
  
    return (
      <div
        className={`fixed top-[64px] left-0 h-[calc(100vh-60px)] bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 z-40 border-t border-gray-200`}
      >
        <div className="p-4 overflow-y-auto h-full">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-theme-color-base bg-white focus:outline-none focus:border-theme-color-primary focus:ring-1 focus:ring-theme-color-primary"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
  
          <div className="space-y-2">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className="w-full px-4 py-3 rounded-md flex items-center space-x-3 hover:bg-theme-color-base transition-colors duration-200 text-left"
              >
                <LuComputer className="text-primary" />
                <span className="text-theme-color-neutral-content font-medium text-primary">
                  {topic.topic_name}
                </span>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <div className="text-center py-4 text-theme-color-neutral">
                No topics found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default Sidebar;