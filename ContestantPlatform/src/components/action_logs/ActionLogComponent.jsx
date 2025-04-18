import React from "react";

const ActionLogs = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-gray-500">No activity logs available</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => {
        const formattedDate = new Date(log.actionDate).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        return (
          <p key={index} className="text-sm">
            [{formattedDate}]{" "}
            <strong className="text-red-500 font-bold">{log.userName}</strong>{" "}
            {log.actionDetail}
          </p>
        );
      })}
    </div>
  );
};

export default ActionLogs;