import React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

export default function RangeSelector({ range, onChange, onOpenCustom }) {
  const options = [
    { label: "All", value: "" },
    { label: "Today", value: "today" },
    { label: "Last Week", value: "week" },
    { label: "Last Month", value: "month" },
    { label: "Last Year", value: "year" },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      {/* Range Options */}
      <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 bg-white border border-gray-200/70 rounded-xl p-2 shadow-sm">
        {options.map((opt) => {
          const isActive = range === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() =>
                opt.value === "custom" ? onOpenCustom?.() : onChange(opt.value)
              }
              className={`px-4 py-1 text-sm font-medium rounded-lg border transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-sm"
                  : "text-gray-600 border-transparent hover:text-blue-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Custom Range Button */}
      <button
        onClick={onOpenCustom}
        className="flex items-center gap-2.5 text-sm font-medium pl-3 pr-2 py-1.5 rounded-lg bg-white text-blue-700 border border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 justify-center"
      >
        <CalendarDays className="w-5 h-5" />
        <span>Select Period</span>
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
