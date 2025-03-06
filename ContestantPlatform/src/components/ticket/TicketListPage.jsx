import React, { useEffect, useState } from "react";
import { BiTime } from "react-icons/bi";
import { BsCheckCircle, BsClock, BsXCircle } from "react-icons/bs";
import {
  FaExclamationCircle,
  FaPlus,
  FaSearch,
  FaTicketAlt,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  API_LIST_TICKET,
  API_TICKET_CREATE_BY_USER,
  BASE_URL,
} from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";
import Swal from "sweetalert2";

const TicketList = () => {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const ticketTypes = ["Error", "Bug", "Issues", "Question"];

  const fetchTickets = async () => {
    try {
      const api = new ApiHelper(BASE_URL);
      const response = await api.get(API_LIST_TICKET);
      if (response && response.tickets) {
        setTickets(response.tickets);
      } else {
        throw new Error("Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error occurred:", err);
      if (err.response.status === 403) {
        setError("F-CTF has ended. Please wait until our new notification");
      } else {
        setError("Could not load tickets. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <BsClock className="text-yellow-500" />;
      case "in_progress":
        return <BiTime className="text-theme-color-primary" />;
      case "Closed":
        return <BsCheckCircle className="text-theme-color-secondary" />;
      default:
        return <BsXCircle className="text-red-500" />;
    }
  };

  const handleCreateTicket = () => {
    setShowModal(true); // Directly show the modal form
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setShowModal(false);

      const api = new ApiHelper(BASE_URL);
      const ticketData = {
        title: e.target.title.value,
        type: e.target.type.value,
        description: e.target.description.value,
      };

      const response = await api.post(API_TICKET_CREATE_BY_USER, ticketData);

      if (response.status === true) {
        // Success: Add the new ticket to the list
        setError(""); // Clear any previous errors
        Swal.fire({
          title: "Success",
          text: "Ticket sent successfully!",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "rounded-md bg-theme-color-primary px-4 py-2 text-white transition-all hover:bg-theme-color-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-color-primary focus:ring-offset-2",
          },
        });
        fetchTickets();
      } else {
        // Handle different error cases
        const message =
          response.message ||
          response.error ||
          "Failed to send the ticket. Please try again.";
        setError(message);
      }
    } catch (err) {
      console.error("Error occurred:", err);
      setError(
        err.response.data.message ||
          "Failed to send the ticket. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-red-100 p-4 text-red-700">
          <FaExclamationCircle />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto"
            aria-label="Close error message"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Support Tickets</h1>
        <button
          onClick={handleCreateTicket}
          className="flex items-center gap-2 rounded-md bg-theme-color-primary px-4 py-2 text-white transition-all hover:bg-theme-color-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-color-primary focus:ring-offset-2"
          aria-label="Create new ticket"
        >
          <FaPlus />
          <span>Create New Ticket</span>
        </button>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-4 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="group cursor-pointer rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-theme-color-primary"
            tabIndex="0"
            role="button"
            aria-label={`Ticket ${ticket.id}: ${ticket.title}`}
            onClick={() => handleTicketClick(ticket.id)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-theme-color-primary" />
                <span className="font-medium text-gray-600">{ticket.id}</span>
              </div>
              <span className="capitalize">{ticket.type}</span>
              {getStatusIcon(ticket.status)}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 group-hover:text-theme-color-primary">
              {ticket.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Created: {ticket.date}</span>
              <span className="capitalize">
                {ticket.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create New Ticket</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                  required
                >
                  {ticketTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-theme-color-primary focus:outline-none focus:ring-1 focus:ring-theme-color-primary"
                  rows="3"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-theme-color-primary px-4 py-2 text-white transition-all hover:bg-theme-color-primary-dark"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
