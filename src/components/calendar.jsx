import React, { useState, useEffect } from "react";

export default function Calendar({ value, onChange }) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  useEffect(() => {
    if (value) setCurrentMonth(value);
  }, [value]);

  const today = new Date();

  const daysInMonth = Array.from(
    {
      length: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).getDate(),
    },
    (_, i) => i + 1
  );

  const handlePrevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const handleDayClick = (day) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (newDate <= today) onChange(newDate);
  };

  const isSameDay = (d1, d2) =>
    d1 &&
    d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="bg-white p-2 rounded-lg shadow border border-gray-200 w-max text-[0.7rem] sm:text-xs">
      <div className="flex justify-between items-center mb-1 px-1">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          ◀
        </button>
        <span className="font-semibold text-gray-800 text-sm sm:text-sm">
          {currentMonth.toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-gray-400 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="font-medium py-0.5 text-gray-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {daysInMonth.map((day) => {
          const dateObj = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          const isToday = isSameDay(dateObj, today);
          const isSelected = isSameDay(dateObj, value);
          const isFuture = dateObj > today;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-medium transition
                ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                }
                ${isToday && !isSelected ? "border border-blue-400" : ""}
                ${
                  isFuture
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-100 hover:text-blue-700"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
