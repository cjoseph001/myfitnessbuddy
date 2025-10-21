import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authcontext";
import RangeSelector from "../../components/analytics/rangeselector";
import SessionTable from "../../components/analytics/sessiontable";
import SummaryCard from "../../components/analytics/summarycard";
import MuscleWorkedTable from "../../components/analytics/muscleworkedtable";
import ExerciseWorkedTable from "../../components/analytics/exerciseworkedtable";
import ExercisePerformance from "../../components/analytics/exerciseperformance";
import MuscleDistribution from "../../components/analytics/muscledistribution";
import { API_BASE_URL } from "../../config/api";

function formatPretty(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const rangeLabelMap = {
  today: "Today",
  week: "Last 7 Days",
  month: "Last 30 Days",
  year: "Last Year",
  custom: "the Selected Period",
  "": "All Period",
};

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [range, setRange] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const buildUrl = () => {
    const base = `${API_BASE_URL}/api/analytics/sessions`;
    const params = new URLSearchParams();
    params.set("user_id", user.id);
    if (range) params.set("range", range);
    if (range === "custom" && customStart && customEnd) {
      params.set("start_date", customStart);
      params.set("end_date", customEnd);
    }
    return `${base}?${params.toString()}`;
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(buildUrl())
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [user, range, customStart, customEnd]);

  const handleOpenCustom = () => {
    setTempStart(customStart || "");
    setTempEnd(customEnd || "");
    setShowCustomModal(true);
  };

  const handleConfirmCustom = () => {
    if (!tempStart || !tempEnd) {
      alert("Please select both start and end dates.");
      return;
    }
    if (new Date(tempStart) > new Date(tempEnd)) {
      alert("Start date must be before or equal to end date.");
      return;
    }
    setCustomStart(tempStart);
    setCustomEnd(tempEnd);
    setShowCustomModal(false);
    setRange("custom");
  };

  const handleRangeChange = (next) => {
    if (next !== "custom") {
      setCustomStart("");
      setCustomEnd("");
    }
    setRange(next);
  };

  const titleLabel = rangeLabelMap[range] || "All Time";

  let subtitle = "";
  if (range === "" && stats?.periodStart && stats?.periodEnd) {
    subtitle = `${formatPretty(stats.periodStart)} - ${formatPretty(
      stats.periodEnd
    )}`;
  } else if (stats?.periodStart && stats?.periodEnd) {
    subtitle = `${formatPretty(stats.periodStart)} - ${formatPretty(
      stats.periodEnd
    )}`;
  } else if (customStart && customEnd) {
    subtitle = `${formatPretty(customStart)} - ${formatPretty(customEnd)}`;
  }

  const getTotalDuration = (sessions) => {
    if (!sessions?.length) return "0m";
    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getExerciseVariety = (sessions) => {
    if (!sessions?.length) return 0;
    const exerciseSet = new Set();
    sessions.forEach((session) => {
      (session.exercises || []).forEach((ex) => exerciseSet.add(ex.name));
    });
    return exerciseSet.size;
  };

  const availableTabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Exercise Performance" },
    { id: "muscle", label: "Muscle Distribution" },
  ];

  return (
    <div className="px-8 py-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            MyFitnessBuddy <span className="text-blue-600">Analytics</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Personalized insights based on your training data
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-semibold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{user?.email}</span>
            <span className="text-xs text-gray-500">Logged in User</span>
          </div>
        </div>
      </div>

      <RangeSelector
        range={range}
        onChange={handleRangeChange}
        onOpenCustom={handleOpenCustom}
      />

      <div className="mb-4 mt-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Workout Analytics for{" "}
          <span className="text-blue-600">{titleLabel}</span>
        </h3>
        {subtitle && (
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading analytics...
        </div>
      ) : stats ? (
        <>
          {!stats.sessions?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-tr from-blue-50 to-white border border-blue-100 rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
              <div className="flex items-center justify-center w-14 h-14 mb-4 bg-blue-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Workouts Found
              </h3>

              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                You have not logged any workouts yet. Track your sessions to
                unlock detailed analytics and performance insights.
              </p>

              <button
                onClick={() => (window.location.href = "/workouts")}
                className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5 active:shadow-md"
              >
                Create a Workout Today
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 mb-5">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-500 bg-gradient-to-b from-blue-50 to-transparent"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <SummaryCard
                      title="Total Workouts"
                      value={stats.totalWorkouts}
                    />
                    <SummaryCard title="Total Sets" value={stats.totalSets} />
                    <SummaryCard title="Total Reps" value={stats.totalReps} />
                    <SummaryCard
                      title="Total Volume"
                      value={stats.totalVolume}
                      unit="kg"
                    />
                    <SummaryCard
                      title="Total Duration"
                      value={getTotalDuration(stats.sessions)}
                    />
                    <SummaryCard
                      title="Exercise Variety"
                      value={getExerciseVariety(stats.sessions)}
                    />
                  </div>
                  <SessionTable sessions={stats.sessions || []} />
                  <MuscleWorkedTable sessions={stats.sessions || []} />
                  <ExerciseWorkedTable
                    sessions={stats.sessions || []}
                    metric="sets"
                  />
                </>
              )}

              {activeTab === "performance" && (
                <ExercisePerformance sessions={stats.sessions || []} />
              )}
              {activeTab === "muscle" && (
                <MuscleDistribution sessions={stats.sessions || []} />
              )}
            </>
          )}
        </>
      ) : null}

      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCustomModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl z-10 p-6 w-full max-w-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              Select Period
            </h4>
            <div className="flex flex-col gap-4">
              <label className="text-sm text-gray-600">
                Start date
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </label>
              <label className="text-sm text-gray-600">
                End date
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustom}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
