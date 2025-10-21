// src/components/analytics/ExercisePerformanceChart.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";

/** Custom tick: just show numbered session */
function CustomTick({ x, y, index }) {
  return (
    <g transform={`translate(${x},${y + 6})`}>
      <text x={0} y={0} textAnchor="middle" fontSize={11} fill="#6b7280">
        {index + 1}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;

  return (
    <div className="bg-white shadow rounded-md px-3 py-2 text-sm border border-gray-100">
      <div className="font-semibold text-gray-800">
        Session {p.sessionIndex}
      </div>
      <div className="text-gray-500 text-xs">
        Date: <span className="font-semibold">{p.date}</span>
      </div>
      <div className="text-gray-500 text-xs">
        Avg 1RM: <span className="font-semibold">{p.avg1RM} kg</span>
      </div>
    </div>
  );
}

export default function ExercisePerformanceChart({ data, exercise }) {
  const prepared = useMemo(() => {
    if (!data || !data.length) return [];
    return data.map((d, i) => ({
      ...d,
      avg1RM: Number(d.avg1RM) || 0,
      sessionIndex: i + 1,
    }));
  }, [data]);

  if (!prepared.length) return null;

  const avg1RM = Math.round(
    prepared.reduce((sum, r) => sum + r.avg1RM, 0) / prepared.length
  );
  const highest1RM = Math.max(...prepared.map((r) => r.avg1RM));
  const highestSession = prepared.find((r) => r.avg1RM === highest1RM);

  let maxImprovement = 0;
  let bestImprovement = { from: null, to: null };
  for (let i = 1; i < prepared.length; i++) {
    const diff = prepared[i].avg1RM - prepared[i - 1].avg1RM;
    if (diff > maxImprovement) {
      maxImprovement = diff;
      bestImprovement = { from: prepared[i - 1], to: prepared[i] };
    }
  }

  const trend =
    prepared.length > 1
      ? prepared[prepared.length - 1].avg1RM > prepared[0].avg1RM
        ? "Increasing"
        : prepared[prepared.length - 1].avg1RM < prepared[0].avg1RM
        ? "Decreasing"
        : "Stable"
      : "N/A";

  const dateRange = `${prepared[0].date} → ${
    prepared[prepared.length - 1].date
  }`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mt-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900">
        {exercise} Progression Chart
      </h3>
      <p className="text-xs text-gray-400 mt-2">
        Tracking{" "}
        <span className="font-semibold">{prepared.length} sessions </span> from{" "}
        <span className="font-semibold">{dateRange}</span>
      </p>
      <p className="text-xs text-gray-500 mt-3">
        Progression are calculated using averaged 1RM weight over sets per
        session data. The chart shows estimated 1RM progression assuming each
        sets are done with maximal effort.
      </p>

      <div className="mt-5 flex justify-center">
        <div className="w-full max-w-[720px] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prepared}
              margin={{ top: 5, right: 26, left: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="grad1RM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />

              <XAxis
                dataKey="sessionIndex"
                tick={(props) => <CustomTick {...props} />}
                height={35}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Session",
                  position: "insideBottom",
                  offset: 0,
                  fontSize: 11,
                  fill: "#475569",
                  fontWeight: 600,
                }}
              />

              <YAxis
                domain={[
                  (dataMin) => Math.floor(dataMin - 5),
                  (dataMax) => Math.ceil(dataMax + 5),
                ]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickMargin={6}
                width={55} // include space for label
                axisLine={{ stroke: "#94a3b8" }}
                tickLine={{ stroke: "#94a3b8" }}
                label={{
                  value: "Averaged 1RM (kg)",
                  angle: -90,
                  position: "left",
                  dx: 0,
                  dy: -50,
                  offset: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  fill: "#475569",
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="avg1RM"
                stroke="none"
                fill="url(#grad1RM)"
                isAnimationActive={false}
              />

              <ReferenceLine
                y={avg1RM}
                stroke="#94a3b8"
                strokeDasharray="4 3"
                label={{
                  value: `Avg: ${avg1RM} kg`,
                  position: "right",
                  fill: "#475569",

                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              <Line
                type="monotone"
                dataKey="avg1RM"
                stroke="#2563eb"
                strokeWidth={2.4}
                dot={{
                  r: 3.5,
                  strokeWidth: 1,
                  fill: "#fff",
                  stroke: "#2563eb",
                }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="flex flex-wrap justify-center gap-10 mt-5 text-center">
        {/* Best Performance */}
        <div className="flex-1 min-w-[150px]">
          <p className="font-medium text-sm text-gray-900">Best Performance</p>
          <p className="text-blue-600 font-semibold text-base">
            {highest1RM} kg
          </p>
          <p className="text-xs text-gray-400">
            {highestSession.date} ({highestSession.sessionIndex})
          </p>
        </div>

        {/* Best Improvement */}
        {bestImprovement.from && bestImprovement.to && (
          <div className="flex-1 min-w-[150px]">
            <p className="font-medium text-gray-900 text-sm">
              Best Improvement
            </p>
            <p className="text-blue-600 font-semibold text-base">
              {maxImprovement} kg
            </p>
            <p className="text-xs text-gray-400">
              {bestImprovement.from.date} ({bestImprovement.from.sessionIndex})
              → {bestImprovement.to.date} ({bestImprovement.to.sessionIndex})
            </p>
          </div>
        )}

        {/* Trend */}
        <div className="flex-1 min-w-[150px]">
          <p className="font-medium text-gray-900 text-sm">Overall Trend</p>
          <p className="text-blue-600 font-semibold text-base">{trend}</p>
          <p className="text-xs text-gray-400">
            Total: {prepared[prepared.length - 1].avg1RM - prepared[0].avg1RM}{" "}
            kg
          </p>
        </div>
      </div>
    </div>
  );
}
