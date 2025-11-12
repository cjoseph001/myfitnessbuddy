import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MuscleDistributionChart({
  data,
  metric,
  onSegmentClick,
}) {
  const chartData = {
    labels: data.map((m) => m.muscle),
    datasets: [
      {
        label: metric,
        data: data.map((m) => m[metric]),
        backgroundColor: [
          "#3b82f6",
          "#60a5fa",
          "#93c5fd",
          "#a5f3fc",
          "#38bdf8",
          "#7dd3fc",
          "#0ea5e9",
          "#22d3ee",
          "#38bdf8",
          "#3b82f6",
        ],
        borderWidth: 2,
        borderColor: "rgba(59, 130, 246, 0.3)",
        hoverOffset: 10,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 4 },
    plugins: {
      legend: {
        position: "right",
        align: "start",
        labels: {
          boxWidth: 16,
          boxHeight: 12,
          padding: 6,
          font: { size: 12, weight: "500" },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#f9fafb",
        titleColor: "#111827",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const muscle = data[context.dataIndex];
            const value =
              metric === "volume"
                ? `${muscle.volume} kg`
                : metric === "reps"
                ? `${muscle.reps} reps`
                : `${muscle.sets} sets`;
            return `${context.label}: ${value} (${muscle.percentVolume}%)`;
          },
        },
      },
      datalabels: { display: false },
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        onSegmentClick(data[index].muscle);
      }
    },
  };

  return (
    <div
      className="relative w-full h-64 sm:h-72 md:h-80 lg:h-72 
                        flex justify-center items-center 
                        bg-blue-50/30 border border-blue-200 rounded-xl px-4 py-6"
    >
      <Pie data={chartData} options={options} />
    </div>
  );
}
