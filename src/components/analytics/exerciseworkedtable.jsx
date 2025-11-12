import React, { useState } from "react";

export default function ExerciseWorkedTable({ sessions }) {
  const [expanded, setExpanded] = useState(false);
  const [metric, setMetric] = useState("sets");

  if (!sessions?.length) return null;

  const exerciseMap = {};

  sessions.forEach((session) => {
    (session.exercises || []).forEach((ex) => {
      if (!ex) return;
      const name = ex?.name || "Unknown";
      const setsArr = Array.isArray(ex?.sets) ? ex.sets : [];

      if (!exerciseMap[name]) {
        exerciseMap[name] = {
          name,
          sessions: 0,
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
        };
      }

      exerciseMap[name].sessions += 1;
      setsArr.forEach((s) => {
        if (!s) return;
        exerciseMap[name].totalSets += 1;
        exerciseMap[name].totalReps += s.reps || 0;
        exerciseMap[name].totalVolume += (s.reps || 0) * (s.weight || 0);
      });
    });
  });

  const exerciseData = Object.values(exerciseMap);
  if (!exerciseData.length)
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg px-5 py-6 max-w-6xl mx-auto mt-4 text-center text-gray-600">
        <h3 className="text-base font-semibold mb-2.5">Exercise Analysis</h3>
        <p className="text-sm">No data available.</p>
      </div>
    );

  const getMetricValue = (ex) => {
    if (metric === "reps") return ex.totalReps;
    if (metric === "volume") return ex.totalVolume;
    return ex.totalSets;
  };

  const mostWorked = exerciseData.reduce(
    (a, b) => (getMetricValue(b) > getMetricValue(a) ? b : a),
    exerciseData[0]
  );
  const leastWorked = exerciseData.reduce(
    (a, b) => (getMetricValue(b) < getMetricValue(a) ? b : a),
    exerciseData[0]
  );

  const displayedData = expanded ? exerciseData : [];

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg px-5 py-4 max-w-6xl mx-auto mt-4 transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-2.5">
        Exercise Analysis
      </h3>

      <div className="flex flex-wrap gap-2 mb-5">
        {["sets", "reps", "volume"].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm ${
              metric === m
                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            title: "Most Worked Exercise",
            color: "from-green-50 to-green-100/60",
            data: mostWorked,
          },
          {
            title: "Least Worked Exercise",
            color: "from-yellow-50 to-yellow-100/60",
            data: leastWorked,
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200`}
          >
            <p className="text-sm font-medium text-gray-600 mb-1">
              {item.title}
            </p>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {item.data?.name || "-"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">
                {getMetricValue(item.data)}
                {metric === "volume" ? " kg" : ""}
              </span>{" "}
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          {expanded ? "Hide Details" : "View Details"}
          <span
            className={`inline-block transform transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
      </div>

      {expanded && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-[900px] w-full text-sm text-gray-700 border-separate border-spacing-0 rounded-xl">
            <thead className="bg-gray-50/90 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold w-12">#</th>
                <th className="px-6 py-3 text-left font-semibold min-w-[180px]">
                  Exercise
                </th>
                <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
                  Sessions
                </th>
                <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                  Sets
                </th>
                <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                  Reps
                </th>
                <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                  Volume (kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((ex, idx) => (
                <tr
                  key={ex.name || idx}
                  className="border-b border-gray-100 hover:bg-blue-50/30 even:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-center text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {ex.name}
                  </td>
                  <td className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                    {ex.sessions}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                    {ex.totalSets}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                    {ex.totalReps}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {ex.totalVolume}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
