import React from "react";

export default function SummaryCard({ title, value, unit }) {
  let displayValue = value;

  if (value === null || value === undefined) {
    displayValue = `0${unit ? ` ${unit}s` : ""}`;
  } else if (unit) {
    displayValue = `${value} ${value === 1 ? unit : `${unit}s`}`;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
      {/* Title with smaller, normal-case text */}
      <div className="text-sm text-gray-500 mb-1">{title}</div>

      {/* Value with slightly smaller font size */}
      <div className="text-base font-semibold text-gray-800">
        {displayValue}
      </div>
    </div>
  );
}
