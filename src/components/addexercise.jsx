import React, { useState } from "react";

export default function AddExerciseModal({ exerciseList, onAdd, onClose }) {
  const [selectedExercises, setSelectedExercises] = useState([]);

  const toggleSelect = (exercise) => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const handleAdd = () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }
    onAdd(selectedExercises);
    setSelectedExercises([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white w-96 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Exercise</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select one or more exercises to add to your current session. Click
            on the cards to select/deselect.
          </p>
          {selectedExercises.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedExercises.length} exercise
              {selectedExercises.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto px-6 py-4 space-y-3">
          {exerciseList.map((ex) => {
            const isSelected = selectedExercises.find((e) => e.id === ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => toggleSelect(ex)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "bg-green-50 border border-green-200 shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{ex.name}</span>
                  <span className="text-sm text-gray-500">
                    {ex.muscle} • {ex.equipment}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-green-600 font-bold text-lg">✓</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2 bg-green-600 text-white rounded-2xl font-medium hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
