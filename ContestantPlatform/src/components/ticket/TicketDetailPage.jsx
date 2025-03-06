import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaInfoCircle, FaReply, FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { API_DETAIL_TICKET, BASE_URL } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const TicketDetailPage = () => {
  const { id }= useParams()
  console.log(`Id get from url is: ${id}`)
  const ticketId = id? parseInt(id,10): undefined
  const [ticket, setTicket]= useState(null)
  const [error, setError]= useState(null)

  useEffect(()=> {
    const fetchTicketDetail= async()=> {
      const api= new ApiHelper(BASE_URL);
      try {
        const response= await api.get(`${API_DETAIL_TICKET}/${ticketId}`)
        console.log(response.ticket)
        setTicket(response.ticket)
      } catch (err) {
        console.error(`Error fetching challenge: ${err}` )
        setError("Could not load ticket. Try Again!")
      }
    };
    fetchTicketDetail()
  }, [ticketId])
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-theme-color-primary p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">
              Ticket Details
            </h1>
            <div className="flex items-center space-x-4">
              
              <span 
                className={`px-4 py-1 rounded-full ${ticket?.status.toLowerCase() === "open" ? "bg-green-500" : "bg-red-500"} text-white`}
              >
                {ticket?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-theme-color-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Author</p>
                  <p className="font-medium">{ticket?.author_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-theme-color-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Creation Date</p>
                  <p className="font-medium">{ticket?.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaReply className="text-theme-color-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Replier</p>
                  <p className="font-medium">{ticket?.replier_name}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Title</h2>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {ticket?.title}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md min-h-[100px]">
                  {ticket?.description}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Reply from {ticket?.replier_name}</h2>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md min-h-[100px]">
                  {ticket?.replier_message}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaInfoCircle className="text-theme-color-primary" />
            <p>Last updated: 2 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;