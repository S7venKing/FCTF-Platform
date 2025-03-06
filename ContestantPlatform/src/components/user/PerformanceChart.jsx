import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceChart = ({ data }) => {
    const processedData = processData(data);

    const labels = Object.keys(processedData); // Tên người dùng
    const correctData = labels.map((name) => processedData[name].correct);
    const failData = labels.map((name) => processedData[name].fail);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Correct Submissions",
                data: correctData,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Fail Submissions",
                data: failData,
                backgroundColor: "rgba(255, 99, 132, 0.6)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
        ],
    };

    return <Pie data={chartData} />;
};

const processData = (data) => {
    const summary = {};

    data.forEach((item) => {
        const userName = item.user.name;
        const type = item.type;

        if (!summary[userName]) {
            summary[userName] = { correct: 0, fail: 0 };
        }

        if (type === "correct") {
            summary[userName].correct += 1;
        } else if (type === "fail") {
            summary[userName].fail += 1;
        }
    });

    return summary;
};

export default PerformanceChart;
