import React, { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../../context/authcontext";
import PaginatedTableWrapper from "../../components/paginatedtablewrapper";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { API_BASE_URL } from "../../config/api";

export default function Trends() {
  const { user } = useContext(AuthContext);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("weekly");
  const [weekWindow, setWeekWindow] = useState({ start: 0, end: 12 });
  const [yearList, setYearList] = useState([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  const colorPalette = [
    "#2563EB",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#A78BFA",
    "#F97316",
    "#14B8A6",
  ];

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/trends/weekly?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const wData = data.weeklyData || [];
        setWeeklyData(wData);

        if (mode === "weekly") setTableData(wData);

        const totalWeeks = wData.length;
        setWeekWindow({ start: Math.max(totalWeeks - 12, 0), end: totalWeeks });
      })
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/trends/monthly?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const mData = data.monthlyData || [];
        setMonthlyData(mData);

        const years = Array.from(new Set(mData.map((d) => d.year))).sort(
          (a, b) => a - b
        );
        setYearList(years);
        if (years.length) setSelectedYearIndex(years.length - 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const formatWeekLabel = (label) => {
    if (!label) return "";
    return label
      .split(" - ")
      .map((d) => {
        const [day, month] = d.split(" ");
        const monthMap = {
          Jan: "01",
          Feb: "02",
          Mar: "03",
          Apr: "04",
          May: "05",
          Jun: "06",
          Jul: "07",
          Aug: "08",
          Sept: "09",
          Oct: "10",
          Nov: "11",
          Dec: "12",
        };
        return `${day}/${monthMap[month]}`;
      })
      .join(" - ");
  };

  const formatMonthLabel = (raw) => {
    if (!raw) return "";
    if (typeof raw === "string" && raw.includes("-")) {
      const [y, m] = raw.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[Number(m) - 1]} ${y}`;
    } else if (raw.monthLabel) return raw.monthLabel;
    return raw;
  };

  const allMuscles = useMemo(() => {
    const muscles = new Set();
    const gather = (arr) => {
      for (const p of arr || []) {
        const mv = p.muscleVolumes || {};
        Object.keys(mv).forEach((m) => muscles.add(m));
      }
    };
    gather(weeklyData);
    gather(monthlyData);
    return Array.from(muscles).sort();
  }, [weeklyData, monthlyData]);

  const selectedYear = yearList.length ? yearList[selectedYearIndex] : null;
  const monthlyChartData = useMemo(() => {
    if (!selectedYear) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyData.find(
        (d) => d.year === selectedYear && d.month === month
      );
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      return found
        ? { ...found }
        : {
            monthLabel: `${monthNames[i]} ${selectedYear}`,
            year: selectedYear,
            month,
            count: 0,
            totalVolume: 0,
            totalDuration: 0,
            muscleVolumes: {},
          };
    });
  }, [monthlyData, selectedYear]);

  const monthlyTableData = useMemo(() => {
    if (!monthlyData.length) return [];
    const sorted = [...monthlyData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return sorted.filter((d) => {
      const now = new Date();
      return (
        d.year < now.getFullYear() ||
        (d.year === now.getFullYear() && d.month <= now.getMonth() + 1)
      );
    });
  }, [monthlyData]);

  useEffect(() => {
    setFilterStart("");
    setFilterEnd("");
    setSelectedMuscles([]);
    setFilterApplied(false);

    if (mode === "weekly") {
      const totalWeeks = weeklyData.length;
      setWeekWindow({ start: Math.max(totalWeeks - 12, 0), end: totalWeeks });
      setTableData([...weeklyData]);
    } else if (mode === "monthly") {
      setTableData([...monthlyTableData]);
    }
  }, [mode, weeklyData, monthlyTableData]);

  const weeklyChartData = weeklyData.slice(weekWindow.start, weekWindow.end);
  const chartData = mode === "weekly" ? weeklyChartData : monthlyChartData;

  const handlePrev = () => {
    if (mode === "weekly") {
      setWeekWindow((prev) => ({
        start: Math.max(prev.start - 1, 0),
        end: Math.max(prev.end - 1, 12),
      }));
    } else {
      setSelectedYearIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleNext = () => {
    if (mode === "weekly") {
      setWeekWindow((prev) => {
        const start = Math.min(
          prev.start + 1,
          Math.max(weeklyData.length - 12, 0)
        );
        const end = Math.min(prev.end + 1, weeklyData.length);
        return { start, end };
      });
    } else {
      setSelectedYearIndex((prev) =>
        Math.min(prev + 1, Math.max(yearList.length - 1, 0))
      );
    }
  };

  const toggleMuscle = (muscle) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const muscleColorMap = useMemo(() => {
    const map = {};
    allMuscles.forEach((m, i) => {
      map[m] = colorPalette[i % colorPalette.length];
    });
    map["Total Volume"] = "#F59E0B";
    return map;
  }, [allMuscles]);

  const tableDescription =
    mode === "weekly"
      ? "Summarized weekly workout frequency, duration, and total volume."
      : "Summarized monthly workout frequency, duration, and total volume.";

  const applyFilter = () => {
    let filtered = [];

    if (mode === "weekly") {
      const parseWeekLabel = (label) => {
        const [startStr, endStr] = label.split(" - ");
        const monthMap = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sept: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        const currentYear = new Date().getFullYear();
        const parseDate = (str) => {
          const [day, month] = str.split(" ");
          return new Date(currentYear, monthMap[month], Number(day));
        };
        return { weekStart: parseDate(startStr), weekEnd: parseDate(endStr) };
      };

      const startDate = filterStart
        ? new Date(filterStart + "T00:00:00")
        : parseWeekLabel(weeklyData[0].weekLabel).weekStart;
      const endDate = filterEnd
        ? new Date(filterEnd + "T23:59:59")
        : parseWeekLabel(weeklyData[weeklyData.length - 1].weekLabel).weekEnd;

      filtered = weeklyData.filter((row) => {
        const { weekStart, weekEnd } = parseWeekLabel(row.weekLabel);
        return weekEnd >= startDate && weekStart <= endDate;
      });
    } else if (mode === "monthly") {
      filtered = monthlyTableData.filter((row) => {
        const rowYM = row.year * 100 + row.month; // e.g., 202507 for July 2025
        const firstMonthYM =
          monthlyTableData[0].year * 100 + monthlyTableData[0].month;

        const startYM = filterStart
          ? Math.max(parseInt(filterStart.replace("-", "")), firstMonthYM)
          : firstMonthYM;

        const endYM = filterEnd
          ? parseInt(filterEnd.replace("-", ""))
          : monthlyTableData[monthlyTableData.length - 1].year * 100 +
            monthlyTableData[monthlyTableData.length - 1].month;

        return rowYM >= startYM && rowYM <= endYM;
      });
    }

    setTableData(filtered);
    setFilterApplied(true);
    setFilterModalOpen(false);
  };

  return (
    <div className="px-4 sm:px-8 py-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            MyFitnessBuddy <span className="text-blue-600">Trends</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-2 sm:mb-0">
            Track weekly or monthly workout trends by frequency or volume
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-semibold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{user?.email}</span>
            <span className="text-xs text-gray-500">Logged in User</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : weeklyData.length === 0 && monthlyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-tr from-blue-50 to-white border border-blue-100 rounded-2xl shadow-md relative overflow-hidden">
          {/* Decorative Circle in Background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>

          {/* Icon */}
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

          {/* Headline */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Workouts Found
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            You have not logged any workouts yet. Log your workout daily to view
            trends.
          </p>

          {/* Button */}
          <button
            onClick={() => (window.location.href = "/workouts")}
            className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5 active:shadow-md"
          >
            Create a Workout Today
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center space-x-0 sm:space-x-3 gap-2 mb-5.5">
            <button
              onClick={() => setMode("weekly")}
              className={`flex-1 sm:flex-auto px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 
    ${
      mode === "weekly"
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/50"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md hover:shadow-gray-300/40"
    }focus:outline-none focus:scale-105 focus:shadow-lg focus:shadow-blue-400/40`}
            >
              Weekly
            </button>
            <button
              onClick={() => setMode("monthly")}
              className={`flex-1 sm:flex-auto px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 
    ${
      mode === "monthly"
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/50"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md hover:shadow-gray-300/40"
    }
    focus:outline-none focus:scale-105 focus:shadow-lg focus:shadow-blue-400/40`}
            >
              Monthly
            </button>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border-2 border-blue-100 overflow-x-auto">
            <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {mode === "weekly"
                    ? "Weekly Workout Frequency & Duration Trend"
                    : `Monthly Workout Frequency & Duration Trend — ${
                        selectedYear || ""
                      }`}
                </h2>
                {chartData.length > 0 && (
                  <p className="text-gray-500 text-sm">
                    Showing data from{" "}
                    <span className="font-medium">
                      {mode === "weekly"
                        ? formatWeekLabel(chartData[0].weekLabel)
                        : formatMonthLabel(chartData[0].monthLabel)}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {mode === "weekly"
                        ? formatWeekLabel(
                            chartData[chartData.length - 1].weekLabel
                          )
                        : formatMonthLabel(
                            chartData[chartData.length - 1].monthLabel
                          )}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                {(mode === "weekly"
                  ? weekWindow.start > 0
                  : selectedYearIndex > 0) && (
                  <button
                    onClick={handlePrev}
                    className="text-sm px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-medium shadow-sm
                 hover:bg-gray-100 transition-all duration-200"
                  >
                    ← Previous
                  </button>
                )}

                {(mode === "weekly"
                  ? weekWindow.end < weeklyData.length
                  : selectedYearIndex < Math.max(yearList.length - 1, 0)) && (
                  <button
                    onClick={handleNext}
                    className="text-sm px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium shadow-sm
                 hover:bg-gray-100 transition-all duration-200"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto mb-4">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 15 }}
                  barGap={8}
                >
                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey={mode === "weekly" ? "weekLabel" : "monthLabel"}
                    tickFormatter={(v) =>
                      mode === "weekly"
                        ? formatWeekLabel(v)
                        : formatMonthLabel(v)
                    }
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tick={{ fontSize: 12, fill: "#4b5563" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#4b5563" }}
                    label={{
                      value: "Sessions",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#4b5563" }}
                    label={{
                      value: "Duration (min)",
                      angle: -90,
                      position: "insideRight",
                      fill: "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f0f4f8" }}
                    contentStyle={{
                      backgroundColor: "#ffffffcc",
                      borderRadius: 8,
                      border: "none",
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={40}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 13,
                    }}
                  />

                  {/* Bars */}
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Total Sessions"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="totalDuration"
                    name="Total Duration"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {mode === "weekly"
                  ? "Weekly Workout Volume Trend"
                  : "Monthly Workout Volume Trend"}
              </h3>

              <p className="text-gray-500 text-sm mb-1">
                Click to show/hide specific muscles in the chart.
              </p>

              <div className="w-full overflow-x-auto py-2 mb-2">
                <div className="flex flex-nowrap gap-2">
                  {allMuscles.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMuscle(m)}
                      className={`
          flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl transition-all duration-200
          ${
            selectedMuscles.includes(m)
              ? "bg-blue-100 text-blue-700 shadow-inner"
              : "bg-white text-blue-500 border border-blue-100 hover:bg-blue-50"
          }
        `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={mode === "weekly" ? "weekLabel" : "monthLabel"}
                      tickFormatter={(v) =>
                        mode === "weekly"
                          ? formatWeekLabel(v)
                          : formatMonthLabel(v)
                      }
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={40}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: "Volume (KG)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#374151",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend
                      verticalAlign="top"
                      height={46}
                      content={({ payload }) => {
                        if (!payload) return null;
                        const filtered = payload.filter(
                          (p) =>
                            p.value === "Total Volume" ||
                            selectedMuscles.includes(p.value)
                        );
                        return (
                          <div className="flex flex-nowrap gap-2 overflow-x-auto">
                            {filtered.map((p, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap"
                                style={{
                                  color: p.color,
                                }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full mr-1"
                                  style={{ background: p.color }}
                                />
                                {p.value}
                              </span>
                            ))}
                          </div>
                        );
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="totalVolume"
                      name="Total Volume"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    {allMuscles.map((m) => (
                      <Line
                        key={m}
                        type="monotone"
                        dataKey={(d) => d.muscleVolumes?.[m] || 0}
                        name={m}
                        stroke={muscleColorMap[m]}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                        hide={!selectedMuscles.includes(m)}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="px-5 py-5 bg-white border border-blue-100 rounded-xl shadow-lg mt-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 rounded-t-xl">
              <div className="mb-5">
                <h3 className="text-gray-900 text-lg mb-1 font-semibold">
                  {mode === "weekly" ? "Weekly" : "Monthly"} Workout Summary
                  Table
                </h3>
                <p className="text-gray-500 text-sm mb-1">{tableDescription}</p>
                <div className="mt-5 text-gray-500 text-xs">
                  {tableData.length > 0 ? (
                    <>
                      Found {tableData.length}{" "}
                      {mode === "weekly" ? "week" : "month"}
                      {tableData.length > 1 ? "s" : ""} of data from{" "}
                      <span className="font-medium">
                        {mode === "weekly"
                          ? formatWeekLabel(tableData[0].weekLabel)
                          : formatMonthLabel(tableData[0].monthLabel)}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {mode === "weekly"
                          ? formatWeekLabel(
                              tableData[tableData.length - 1].weekLabel
                            )
                          : formatMonthLabel(
                              tableData[tableData.length - 1].monthLabel
                            )}
                      </span>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap space-x-2 gap-2">
                {filterApplied && (
                  <button
                    onClick={() => {
                      setTableData(
                        mode === "weekly" ? weeklyData : monthlyTableData
                      );
                      setFilterApplied(false);
                      setFilterStart("");
                      setFilterEnd("");
                    }}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="px-5 py-2 rounded-full text-sm font-medium text-white 
                  bg-gradient-to-r from-blue-500 to-blue-600 
                  shadow-md shadow-blue-300/50
                  hover:from-blue-600 hover:to-blue-700 
                  hover:shadow-lg hover:shadow-blue-400/50
                  transition-all duration-300 transform hover:-translate-y-0.5 focus:scale-105 focus:outline-none"
                >
                  {mode === "weekly" ? "Filter Weeks" : "Filter Months"}
                </button>
              </div>
            </div>

            {tableData.length > 0 ? (
              <PaginatedTableWrapper data={tableData} rowsPerPage={10}>
                {(currentData) => (
                  <>
                    <table className="min-w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                            {mode === "weekly" ? "Week #" : "#"}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                            {mode === "weekly" ? "Date Range" : "Month"}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                            Sessions
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                            Duration (min)
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                            Total Volume
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentData.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`transition-all duration-200 ${
                              idx % 2 === 0 ? "bg-white" : "bg-blue-50/50"
                            } hover:bg-blue-100`}
                          >
                            <td className="px-5 py-3 whitespace-nowrap font-medium text-gray-800 text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-gray-700 text-sm">
                              {mode === "weekly"
                                ? formatWeekLabel(row.weekLabel)
                                : formatMonthLabel(row.monthLabel)}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-800 text-sm">
                              {row.count || 0}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-800 text-sm">
                              {row.totalDuration || 0}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-800 text-sm">
                              {row.totalVolume || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </PaginatedTableWrapper>
            ) : (
              <div className="px-5 py-16 text-center text-gray-400 text-sm">
                No data available for{" "}
                {mode === "weekly" ? "this week range" : "this month range"}.
              </div>
            )}
          </div>

          {filterModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm sm:w-96 shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {mode === "weekly"
                    ? "Filter by Week Range"
                    : "Filter by Month Range"}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {mode === "weekly"
                    ? 'Select start and end dates. The selected week will include all days in the "week range" that contains the date.'
                    : "Select start and end months for the filter."}
                </p>

                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700">
                    Start {mode === "weekly" ? "Date" : "Month"}
                  </label>
                  <input
                    type={mode === "weekly" ? "date" : "month"}
                    value={filterStart}
                    max={
                      mode === "weekly"
                        ? new Date().toISOString().split("T")[0]
                        : new Date().toISOString().slice(0, 7)
                    }
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="border rounded-lg p-2"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700">
                    End {mode === "weekly" ? "Date" : "Month"}
                  </label>

                  <input
                    type={mode === "weekly" ? "date" : "month"}
                    value={filterEnd}
                    max={
                      mode === "weekly"
                        ? new Date().toISOString().split("T")[0]
                        : new Date().toISOString().slice(0, 7)
                    }
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="border rounded-lg p-2"
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setFilterModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
