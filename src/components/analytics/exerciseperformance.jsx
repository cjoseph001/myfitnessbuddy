import React, { useState, useMemo, useEffect, useRef } from "react";
import { Info, ChevronDown } from "lucide-react";
import SummaryCard from "./summarycard";
import ExercisePerformanceChart from "./exerciseperformancechart";

export default function ExercisePerformance({ sessions }) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showEpleyInfo, setShowEpleyInfo] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  const epleyRef = useRef(null);

  const exerciseStats = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      (s.exercises || []).forEach((ex) => {
        if (ex?.name) map.set(ex.name, (map.get(ex.name) || 0) + 1);
      });
    });
    return map;
  }, [sessions]);

  const exerciseOptions = useMemo(
    () => Array.from(exerciseStats.keys()).sort(),
    [exerciseStats]
  );

  useEffect(() => {
    if (exerciseOptions.length && !selectedExercise) {
      const [topExercise] =
        [...exerciseStats.entries()].sort((a, b) => b[1] - a[1])[0] || [];
      if (topExercise) setSelectedExercise(topExercise);
    }
  }, [exerciseOptions, exerciseStats, selectedExercise]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (epleyRef.current && !epleyRef.current.contains(event.target)) {
        setShowEpleyInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sessionData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .map((s) => {
        const matched = (s.exercises || []).filter(
          (ex) => ex.name === selectedExercise
        );
        if (!matched.length) return null;

        const setsList = [];
        let totalReps = 0;
        let totalVolume = 0;
        let total1RM = 0;

        matched.forEach((ex) => {
          (ex.sets || []).forEach((set, idx) => {
            const reps = set.reps || 0;
            const weight = set.weight || 0;
            const est1RM = Math.round(weight * (1 + reps / 30));
            totalReps += reps;
            totalVolume += reps * weight;
            total1RM += est1RM;
            setsList.push({ setNo: idx + 1, reps, weight, est1RM });
          });
        });

        const avg1RM =
          setsList.length > 0 ? Math.round(total1RM / setsList.length) : 0;

        return {
          date: new Date(s.session_date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: s.start_time,
          session_name: s.name,
          setsList,
          totalReps,
          totalVolume,
          avg1RM,
        };
      })
      .filter(Boolean);
  }, [sessions, selectedExercise]);

  const sortedSessions = useMemo(() => {
    return [...sessionData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [sessionData, sortOrder]);

  const chartData = Array.isArray(sessionData)
    ? [...sessionData]
        .map((s) => ({
          date: s.date ?? "N/A",
          avg1RM: Number(s.avg1RM) || 0,
        }))
        .reverse()
        .map((d, i) => ({ ...d, sessionIndex: i + 1 }))
    : [];

  const insights = useMemo(() => {
    if (!sessionData.length) return null;

    let heaviest = 0;
    let totalSets = 0;
    let totalRepsAll = 0;
    let totalVolumeAll = 0;
    let totalWeightAll = 0;
    let best1RM = 0;
    let bestRecord = null;

    sessionData.forEach((s) => {
      totalSets += s.setsList.length;
      totalRepsAll += s.totalReps;
      totalVolumeAll += s.totalVolume;

      s.setsList.forEach((set) => {
        if (set.weight > heaviest) heaviest = set.weight;
        totalWeightAll += set.weight;
        if (set.est1RM > best1RM) {
          best1RM = set.est1RM;
          bestRecord = { date: s.date, weight: set.weight, reps: set.reps };
        }
      });
    });

    const avgWeight =
      totalSets > 0 ? (totalWeightAll / totalSets).toFixed(1) : 0;
    const avgReps = totalSets > 0 ? (totalRepsAll / totalSets).toFixed(1) : 0;

    return {
      totalSessions: sessionData.length,
      totalSets,
      totalRepsAll,
      totalVolumeAll,
      heaviest,
      best1RM,
      avgWeight,
      avgReps,
      bestRecord,
    };
  }, [sessionData]);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-5 text-center text-gray-600">
        <p>No sessions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-5 max-w-6xl mx-auto mt-5">
      {exerciseOptions.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-5">
            Exercise Performance
          </h3>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-gray-700 text-sm font-medium">
              Select Exercise:
            </label>
            <select
              className="text-xs px-1 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {exerciseOptions.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-gray-600">
          No exercises found. Please add exercises to view performance.
        </p>
      )}

      {selectedExercise && insights && (
        <div className="space-y-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Sessions"
              value={insights.totalSessions}
            />
            <SummaryCard
              title="Total Sets / Reps"
              value={`${insights.totalSets} / ${insights.totalRepsAll}`}
            />
            <SummaryCard
              title="Total Volume"
              value={insights.totalVolumeAll}
              unit="kg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Average / Max Weight"
              value={`${insights.avgWeight} / ${insights.heaviest}`}
              unit="kg"
            />
            <SummaryCard title="Average Reps" value={insights.avgReps} />
            <div className="relative">
              <SummaryCard
                title="Best 1RM (Set)"
                value={insights.best1RM}
                unit="kg"
              />
              <button
                onClick={() => setShowEpleyInfo((prev) => !prev)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition"
              >
                <Info size={16} />
              </button>
              {showEpleyInfo && (
                <div
                  ref={epleyRef}
                  className="absolute right-0 top-full mt-2 bg-white border border-gray-200 text-gray-700 text-xs rounded-xl shadow-lg p-3 w-64 z-10"
                >
                  Estimated using <b>Epley Formula</b>:
                  <br />
                  <code>1RM = weight × (1 + reps / 30)</code>
                  <br />
                  Assumes all sets were taken to failure.
                </div>
              )}
            </div>
          </div>
          {insights.bestRecord && (
            <div className="relative bg-blue-50/50 border border-blue-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🏆</span>
                <p className="font-semibold text-blue-700/80 text-sm">
                  Best Set Record
                </p>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-medium text-gray-900">
                  {insights.bestRecord.weight} kg × {insights.bestRecord.reps}{" "}
                  reps
                </span>{" "}
                achieved on{" "}
                <span className="text-gray-600">
                  {insights.bestRecord.date}
                </span>
              </p>
            </div>
          )}

          {chartData.length > 0 && (
            <ExercisePerformanceChart
              data={chartData}
              exercise={selectedExercise}
            />
          )}
          <div className="flex justify-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="group relative flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl text-sm font-semibold text-white
              bg-gradient-to-r from-blue-600 to-blue-500 
              shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-blue-400
              active:scale-[0.98] transition-all duration-200 mb-1"
            >
              <span>
                {showHistory ? "Hide Session History" : "Show Session History"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showHistory ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>
        </div>
      )}
      {showHistory && sessionData.length > 0 && (
        <div className="space-y-3 mt-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold text-gray-800">
              Session History for{" "}
              <span className="text-blue-700">{selectedExercise}</span>
            </h4>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-blue-100 text-gray-800 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              Show {sortOrder === "desc" ? "Earliest" : "Latest"}
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            Showing{" "}
            <span className="font-semibold">
              {sortedSessions.length} sessions
            </span>{" "}
            found from{" "}
            <span className="font-semibold">
              {sessionData[sessionData.length - 1].date} &rarr;{" "}
              {sessionData[0].date}
            </span>
          </p>

          {sortedSessions.map((s, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-blue-50/30 border border-blue-200 p-4 transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                      {s.session_name || "My Workout"}
                    </span>
                    <span className="text-gray-500 text-xs mt-0.5 font-medium">
                      {s.date}
                    </span>
                    <span className="text-gray-500 text-xs mt-0.5">
                      {s.time}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0 text-sm text-gray-600">
                  <span className="text-blue-700 font-semibold">
                    {s.setsList.length} Sets
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    <span className="font-semibold text-gray-900">
                      {s.totalReps}
                    </span>{" "}
                    Reps
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    <span className="font-semibold text-gray-900">
                      {s.totalVolume}
                    </span>{" "}
                    kg Vol
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    <span className="font-semibold text-gray-900">
                      {s.avg1RM}
                    </span>{" "}
                    kg 1RM
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-blue-100 pt-2">
                {s.setsList.map((set) => (
                  <div
                    key={set.setNo}
                    className="flex justify-between items-center py-2 px-2 text-sm hover:bg-blue-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-12 text-center">
                        Set {set.setNo}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {set.weight} kg × {set.reps} reps
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      {set.est1RM} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
