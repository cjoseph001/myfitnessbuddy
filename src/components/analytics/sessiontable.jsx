import React, { useState } from "react";
import PaginatedTableWrapper from "../paginatedtablewrapper";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "-";
  try {
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function SessionTable({ sessions }) {
  const hasSessions = sessions && sessions.length > 0;

  if (!hasSessions) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md p-10 text-center text-gray-500 text-lg">
        No sessions found for this period.
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg px-5 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Workout History
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"}{" "}
            found
          </p>
        </div>
      </div>

      <PaginatedTableWrapper data={sessions} rowsPerPage={10}>
        {(currentData) => (
          <>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-[850px] w-full text-sm text-gray-700 border-separate border-spacing-0">
                <thead className="bg-gray-50/90 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold w-12">
                      #
                    </th>
                    <th className="px-6 py-3 text-left font-semibold min-w-[120px]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left font-semibold min-w-[100px]">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left font-semibold min-w-[140px]">
                      Name
                    </th>
                    <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                      Exercises
                    </th>
                    <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                      Sets / Reps
                    </th>
                    <th className="px-6 py-3 text-right font-semibold whitespace-nowrap">
                      Volume (kg)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((s, idx) => {
                    const totalSets = (s.exercises || []).reduce(
                      (acc, e) => acc + (e.sets?.length || 0),
                      0
                    );
                    const totalReps = (s.exercises || []).reduce(
                      (acc, e) =>
                        acc +
                        (e.sets || []).reduce(
                          (sum, set) => sum + (set.reps || 0),
                          0
                        ),
                      0
                    );
                    const totalVolume = (s.exercises || []).reduce(
                      (acc, e) =>
                        acc +
                        (e.sets || []).reduce(
                          (sum, set) =>
                            sum + (set.reps || 0) * (set.weight || 0),
                          0
                        ),
                      0
                    );

                    return (
                      <tr
                        key={s.id || idx}
                        className="border-b border-gray-100 hover:bg-blue-50/30 even:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-gray-500">
                          {sessions.indexOf(s) + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {formatDate(s.session_date)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {formatTime(s.start_time)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 min-w-[140px]">
                          {s.name || "Workout"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                          {(s.exercises || []).length}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                          {`${totalSets} / ${totalReps}`}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                          {totalVolume}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </PaginatedTableWrapper>
    </div>
  );
}
