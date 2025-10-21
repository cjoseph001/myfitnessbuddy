import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

export default function ExerciseSelector({
  exerciseList,
  tempSelectedIds,
  toggleSelectExercise,
  onConfirm,
  onCancel,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMuscle, setActiveMuscle] = useState("All");

  const muscleTabs = useMemo(() => {
    const muscles = Array.from(new Set(exerciseList.map((ex) => ex.muscle)));
    return ["All", ...muscles];
  }, [exerciseList]);

  const filteredExercises = useMemo(() => {
    return exerciseList.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMuscle =
        activeMuscle === "All" || ex.muscle === activeMuscle;

      return matchesSearch && matchesMuscle;
    });
  }, [exerciseList, searchTerm, activeMuscle]);

  const selectedCount = tempSelectedIds.length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl ring-1 ring-gray-100">
        <div className="flex justify-between items-start px-6 pt-4 pb-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Exercise Selector
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tap an exercise to select or deselect it. Click "Select" to
              confirm.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-3.5">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 mb-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition">
            <Search className="w-5 h-7 text-gray-500" />
            <input
              type="text"
              placeholder="Search exercises by name, muscle, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
            {muscleTabs.map((muscle) => {
              const active = muscle === activeMuscle;
              return (
                <button
                  key={muscle}
                  onClick={() => setActiveMuscle(muscle)}
                  className={`px-3 py-2 mr-3 text-sm transition-colors duration-200 ${
                    active
                      ? "text-blue-600 font-bold border-b-2 border-blue-600"
                      : "text-gray-600 font-normal hover:text-blue-600 border-b-2 border-transparent"
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((ex) => {
                const isSelected = tempSelectedIds.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleSelectExercise(ex.id)}
                    className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer border h-[130px] transition-all duration-300 shadow-sm hover:shadow-md ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 scale-[1.02]"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`font-semibold text-center text-gray-800 text-base truncate w-full ${
                        isSelected ? "text-blue-800" : ""
                      }`}
                    >
                      {ex.name}
                    </span>

                    <div className="flex justify-center gap-1.5 mt-3 text-sm text-gray-600">
                      {ex.muscle} <span className="text-gray-400">•</span>{" "}
                      {ex.equipment}
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-300/50 pointer-events-none animate-pulse" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex justify-center items-center py-12 text-gray-500 text-sm">
                No exercises found.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 sticky">
          {selectedCount > 0 ? (
            <p className="pl-2 text-sm font-semibold text-blue-600">
              {selectedCount} exercise{selectedCount !== 1 ? "s" : ""} selected
            </p>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            {selectedCount > 0 && (
              <button
                onClick={onConfirm}
                className="px-5 py-2 text-sm rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Confirm Selection
              </button>
            )}
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
