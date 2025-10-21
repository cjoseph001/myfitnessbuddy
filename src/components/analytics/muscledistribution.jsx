// src/pages/analytics/MuscleDistribution.jsx
import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import SummaryCard from "../../components/analytics/summarycard";
import MuscleDistributionChart from "./muscledistributionchart";

export default function MuscleDistribution({ sessions = [] }) {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [chartMetric, setChartMetric] = useState("volume");
  const [showSessions, setShowSessions] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  // --- Compute overall muscle stats ---
  const muscleStats = useMemo(() => {
    const result = {};
    let totalVolume = 0;

    sessions.forEach((session) => {
      (session.exercises || []).forEach((ex) => {
        if (!ex.muscle || !ex.sets?.length) return;

        const setsCount = ex.sets.length;
        const repsCount = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
        const volume = ex.sets.reduce(
          (sum, s) => sum + (s.reps || 0) * (s.weight || 0),
          0
        );
        totalVolume += volume;

        if (!result[ex.muscle])
          result[ex.muscle] = {
            sets: 0,
            reps: 0,
            volume: 0,
            exercises: new Map(),
            sessions: new Set(),
          };

        result[ex.muscle].sets += setsCount;
        result[ex.muscle].reps += repsCount;
        result[ex.muscle].volume += volume;

        const prevCount =
          result[ex.muscle].exercises.get(ex.name || ex.exercise_name) || 0;
        result[ex.muscle].exercises.set(
          ex.name || ex.exercise_name,
          prevCount + 1
        );
        result[ex.muscle].sessions.add(session.name);
      });
    });

    return Object.entries(result)
      .map(([muscle, data]) => {
        const favExercise =
          Array.from(data.exercises.entries()).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0] || "-";

        return {
          muscle,
          sets: data.sets,
          reps: data.reps,
          volume: data.volume,
          percentVolume: totalVolume
            ? ((data.volume / totalVolume) * 100).toFixed(1)
            : 0,
          exercises: Array.from(data.exercises.keys()),
          sessions: Array.from(data.sessions),
          avgLoad: data.sets ? (data.volume / data.sets).toFixed(1) : 0,
          totalSessions: data.sessions.size,
          favExercise,
          exerciseVariety: data.exercises.size,
        };
      })
      .sort((a, b) => b.volume - a.volume);
  }, [sessions]);

  const muscleDetail = useMemo(
    () => muscleStats.find((m) => m.muscle === selectedMuscle),
    [selectedMuscle, muscleStats]
  );

  // --- Filter session list by muscle ---
  const muscleSessions = useMemo(() => {
    if (!selectedMuscle) return [];

    const filtered = sessions
      .map((s) => {
        const matchedExercises = (s.exercises || []).filter(
          (ex) => ex.muscle === selectedMuscle
        );
        if (!matchedExercises.length) return null;

        const exerciseMap = new Map();
        matchedExercises.forEach((ex) => {
          const setsList = ex.sets.map((set, idx) => ({
            setNo: idx + 1,
            reps: set.reps || 0,
            weight: set.weight || 0,
            est1RM: Math.round((set.weight || 0) * (1 + (set.reps || 0) / 30)),
          }));
          exerciseMap.set(ex.name || ex.exercise_name, setsList);
        });

        let totalSets = 0;
        let totalReps = 0;
        let totalVolume = 0;
        exerciseMap.forEach((sets) => {
          totalSets += sets.length;
          totalReps += sets.reduce((sum, s) => sum + s.reps, 0);
          totalVolume += sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
        });

        return {
          session_name: s.name,
          date: new Date(s.session_date),
          time: s.start_time,
          totalSets,
          totalReps,
          totalVolume,
          exerciseMap,
        };
      })
      .filter(Boolean);

    return filtered.sort((a, b) =>
      sortOrder === "asc" ? a.date - b.date : b.date - a.date
    );
  }, [selectedMuscle, sessions, sortOrder]);

  const sessionDates = muscleSessions.map((s) => s.date);
  const minDate = sessionDates.length
    ? new Date(Math.min(...sessionDates))
    : null;
  const maxDate = sessionDates.length
    ? new Date(Math.max(...sessionDates))
    : null;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // --- No sessions ---
  if (!sessions.length)
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-5 text-center text-gray-600">
        <p>No sessions found.</p>
      </div>
    );

  // --- No muscle data ---
  if (!muscleStats.length)
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-5 text-center text-sm text-gray-600">
        <p>No data found. Please add exercises to view muscle distribution.</p>
      </div>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-4 sm:p-5 max-w-6xl mx-auto mt-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
            Muscle Distribution
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Tap a segment in the chart below to view{" "}
            <span className="font-medium text-gray-800">muscle analysis</span>.
          </p>

          {selectedMuscle && (
            <div className="inline-flex flex-wrap items-center gap-2 mt-3 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm text-xs sm:text-sm">
              <span className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {selectedMuscle}
                </span>{" "}
                data
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-gray-500">
                {formatDate(minDate)} → {formatDate(maxDate)}
              </span>
            </div>
          )}
        </div>

        {/* Metric Selector */}
        <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
          <label className="text-xs text-gray-500 mb-1.5 font-semibold tracking-wide">
            Display Metric
          </label>
          <select
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-1 sm:pr-5 sm:pl-1 py-1.5 text-xs bg-white 
                  hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 
                  transition-all cursor-pointer"
            value={chartMetric}
            onChange={(e) => setChartMetric(e.target.value)}
          >
            <option value="volume">Volume</option>
            <option value="sets">Sets</option>
            <option value="reps">Reps</option>
          </select>
        </div>
      </div>

      {/* --- Chart --- */}
      <div className="mb-3 sm:mb-4">
        <MuscleDistributionChart
          data={muscleStats}
          metric={chartMetric}
          onSegmentClick={(muscle) => setSelectedMuscle(muscle)}
        />
      </div>

      {/* --- Muscle Details --- */}
      {muscleDetail ? (
        <>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 mt-5">
            {muscleDetail.muscle} Analysis
          </h4>

          {/* Summary Cards */}
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6 -mx-2 px-2">
            <SummaryCard
              title="Sessions"
              value={muscleDetail.totalSessions}
              textSize="text-sm"
            />
            <SummaryCard
              title="Sets / Reps"
              value={`${muscleDetail.sets} / ${muscleDetail.reps}`}
              textSize="text-sm"
            />
            <SummaryCard
              title="Volume"
              value={muscleDetail.volume}
              unit="kg"
              textSize="text-sm"
            />
            <SummaryCard
              title="Variety"
              value={muscleDetail.exerciseVariety}
              textSize="text-sm"
            />
            <SummaryCard
              title="Fav Exercise"
              value={muscleDetail.favExercise}
              textSize="text-sm"
            />
            <SummaryCard
              title="Avg Load"
              value={muscleDetail.avgLoad}
              unit="kg"
              textSize="text-sm"
            />
          </div>

          {/* Session History Toggle */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl text-sm font-semibold text-white
                    bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-200/50
                    hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] transition-all duration-200"
            >
              <span>
                {showSessions ? "Hide Session History" : "Show Session History"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showSessions ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>

          {/* --- Session History --- */}
          {showSessions &&
            (muscleSessions.length > 0 ? (
              <div className="mt-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                    Session History for{" "}
                    <span className="text-gray-800">{selectedMuscle}</span>
                  </h4>
                  <button
                    onClick={() =>
                      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                    }
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-blue-100 text-gray-800 
                          shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-200 self-start sm:self-auto"
                  >
                    Show {sortOrder === "desc" ? "Earliest" : "Latest"}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  Showing{" "}
                  <span className="font-semibold">{muscleSessions.length}</span>{" "}
                  session{muscleSessions.length > 1 ? "s" : ""} from{" "}
                  <span className="font-semibold">
                    {formatDate(minDate)} → {formatDate(maxDate)}
                  </span>
                </p>

                {muscleSessions.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-blue-50/40 border border-blue-200 p-3 sm:p-4 transition hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-700 font-bold rounded-full">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {s.session_name || "Workout"}
                          </div>
                          <div className="text-gray-500 text-xs font-medium">
                            {formatDate(s.date)} — {s.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 sm:mt-0 text-xs sm:text-sm text-gray-600">
                        <span className="text-blue-700 font-semibold">
                          {s.totalSets} Sets
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
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-2 border-t border-blue-100 pt-2">
                      {[...s.exerciseMap.entries()].map(([exName, sets]) => (
                        <div key={exName} className="space-y-1">
                          <div className="text-gray-800 font-semibold text-xs sm:text-sm bg-blue-50/60 px-3 py-1 rounded-xl">
                            {exName}
                          </div>
                          {sets.map((set) => (
                            <div
                              key={set.setNo}
                              className="flex flex-wrap justify-between items-center py-2 px-3 text-xs sm:text-sm hover:bg-blue-50 rounded-lg transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 w-12 sm:w-14 text-center">
                                  Set {set.setNo}
                                </span>
                                <span className="text-gray-800 font-medium">
                                  {set.weight} kg × {set.reps} reps
                                </span>
                              </div>
                              <div className="text-gray-500 font-medium mt-1 sm:mt-0">
                                {set.est1RM} kg
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No session history found for this muscle.
              </p>
            ))}
        </>
      ) : null}
    </div>
  );
}
