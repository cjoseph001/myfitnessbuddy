import React, { useState } from "react";

export default function MuscleWorkedTable({ sessions }) {
  const [expanded, setExpanded] = useState(false);
  const [metric, setMetric] = useState("sets"); // default metric

  if (!sessions?.length) return null;

  const muscleMap = {};

  sessions.forEach((session) => {
    const sessionMuscles = new Set();

    (session.exercises || []).forEach((ex) => {
      if (!ex) return;

      const muscle = ex?.muscle || "Unknown";
      const name = ex?.name || "Unknown";
      const sets = Array.isArray(ex?.sets) ? ex.sets : [];

      if (!muscleMap[muscle]) {
        muscleMap[muscle] = {
          name: muscle,
          sessions: 0,
          exercises: new Set(),
          favExerciseCount: {},
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
        };
      }

      sessionMuscles.add(muscle);
      muscleMap[muscle].exercises.add(name);
      muscleMap[muscle].favExerciseCount[name] =
        (muscleMap[muscle].favExerciseCount[name] || 0) + 1;

      sets.forEach((s) => {
        if (!s) return;
        muscleMap[muscle].totalSets += 1;
        muscleMap[muscle].totalReps += s?.reps || 0;
        muscleMap[muscle].totalVolume += (s?.reps || 0) * (s?.weight || 0);
      });
    });

    sessionMuscles.forEach((m) => muscleMap[m].sessions++);
  });

  const muscleData = Object.values(muscleMap).map((m) => {
    const favExercise =
      Object.entries(m.favExerciseCount).length > 0
        ? Object.entries(m.favExerciseCount).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ["", 0]
          )[0]
        : "-";

    return {
      ...m,
      exerciseVariety: m.exercises.size,
      favExercise,
    };
  });

  if (!muscleData.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg px-5 py-6 max-w-6xl mx-auto mt-4 text-center text-gray-600">
        <h3 className="text-base font-semibold mb-2.5">Muscle Analysis</h3>
        <p className="text-sm">No data available.</p>
      </div>
    );
  }

  const getMetricValue = (m) => {
    if (metric === "reps") return m.totalReps;
    if (metric === "volume") return m.totalVolume;
    return m.totalSets;
  };

  const mostTrained = muscleData.reduce(
    (a, b) => (getMetricValue(b) > getMetricValue(a) ? b : a),
    muscleData[0]
  );
  const leastTrained = muscleData.reduce(
    (a, b) => (getMetricValue(b) < getMetricValue(a) ? b : a),
    muscleData[0]
  );

  const displayedData = expanded ? muscleData : [];

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg px-5 py-4 max-w-6xl mx-auto mt-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2.5">
        Muscle Analysis
      </h3>

      {/* Metric Selector */}
      <div className="flex gap-3 mb-5">
        {["sets", "reps", "volume"].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              metric === m
                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            title: "Most Trained Muscle",
            color: "from-blue-50 to-blue-100/60",
            data: mostTrained,
          },
          {
            title: "Least Trained Muscle",
            color: "from-indigo-50 to-indigo-100/60",
            data: leastTrained,
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-all`}
          >
            <p className="text-sm font-medium text-gray-600 mb-1">
              {item.title}
            </p>

            <p className="text-lg font-semibold text-gray-800 mb-1">
              {item.data?.name || "-"}
            </p>

            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">
                {getMetricValue(item.data).toFixed(0)}
                {metric === "volume" ? " kg" : ""}
              </span>{" "}
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </p>
          </div>
        ))}
      </div>

      {/* Expand / Collapse Button */}
      <div className="text-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
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

      {/* Muscle Table */}
      {expanded && (
        <div className="overflow-x-auto mt-5">
          <table className="min-w-[900px] w-full text-sm text-gray-700 border-separate border-spacing-0 rounded-xl">
            <thead className="bg-gray-50/90 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold w-12">#</th>
                <th className="px-6 py-3 text-left font-semibold min-w-[120px]">
                  Muscle
                </th>
                <th className="px-6 py-3 text-left font-semibold min-w-[140px]">
                  Fav Exercise
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
                <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                  Ex Variety
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((m, idx) => (
                <tr
                  key={m.name || idx}
                  className="border-b border-gray-100 hover:bg-blue-50/30 even:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-center text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {m.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 min-w-[140px]">
                    {m.favExercise}
                  </td>
                  <td className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                    {m.sessions}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                    {m.totalSets}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                    {m.totalReps}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {m.totalVolume.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                    {m.exerciseVariety}
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
