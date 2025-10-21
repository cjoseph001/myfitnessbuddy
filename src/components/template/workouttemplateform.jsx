import React, { useState } from "react";
import ExerciseSelector from "../exerciseselector";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function WorkoutTemplateForm({ exerciseList, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);
  const [error, setError] = useState("");

  const toggleSelectExercise = (id) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((exId) => exId !== id) : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    const selected = exerciseList.filter((ex) =>
      tempSelectedIds.includes(ex.id)
    );
    setSelectedExercises(
      selected.map((ex) => ({
        ...ex,
        sets: [{ set_no: 1, reps: 0, weight: 0 }],
      }))
    );
    setShowSelector(false);
    setError("");
  };

  const handleOpenSelector = () => {
    setTempSelectedIds(selectedExercises.map((ex) => ex.id));
    setShowSelector(true);
  };

  const addSet = (exIdx) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exIdx];
      ex.sets.push({ set_no: ex.sets.length + 1, reps: 0, weight: 0 });
      return updated;
    });
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      updated[exIdx].sets[setIdx][field] = Number(val);
      return updated;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      updated[exIdx].sets.splice(setIdx, 1);
      updated[exIdx].sets.forEach((s, i) => (s.set_no = i + 1));
      return updated;
    });
  };

  const removeExercise = (id) =>
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== id));

  const handleSave = () => {
    if (!title.trim() && !selectedExercises.length)
      return setError("Please enter a title and select at least one exercise.");
    if (!title.trim()) return setError("Please enter a template name.");
    if (!selectedExercises.length)
      return setError("Please select at least one exercise.");
    setError("");

    onSave({ title, exercises: selectedExercises });
    onClose();
  };

  return (
    <div
      className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 
                 rounded-3xl p-5 mb-8 mt-4 max-w-6xl mx-auto shadow-lg hover:shadow-xl 
                 transition-all duration-300"
    >
      <h2 className="text-lg font-bold mb-3 text-gray-900">
        Create Workout Template
      </h2>

      <div className="mb-6">
        <label
          htmlFor="templateTitle"
          className="block text-sm text-gray-600 mb-1.5 font-medium"
        >
          Template Title
        </label>
        <input
          id="templateTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          placeholder="e.g., Push A"
        />
      </div>

      <button
        onClick={handleOpenSelector}
        className="w-full text-sm font-semibold text-blue-800 
             bg-blue-100 hover:bg-blue-200 
             active:bg-blue-300 
             border border-blue-200
             rounded-xl shadow-sm hover:shadow-md
             py-2.5 transition-all duration-200"
      >
        Select Exercises
      </button>

      <div className="mt-8 space-y-6">
        {selectedExercises.map((ex, exIdx) => (
          <div
            key={ex.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm 
                       hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {ex.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {ex.muscle}
                  </span>
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {ex.equipment}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addSet(exIdx)}
                  className="text-sm px-4 py-1.5 font-semibold bg-blue-50 text-blue-700 
                             rounded-xl hover:bg-blue-100 transition"
                >
                  + Add Set
                </button>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="text-sm px-4 py-1.5 font-semibold bg-red-50 text-red-700 
                             rounded-xl hover:bg-red-100 transition"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-2 px-3 text-left font-medium w-20">
                      Set
                    </th>
                    <th className="py-2 px-3 text-left font-medium w-32">
                      Weight (kg)
                    </th>
                    <th className="py-2 px-3 text-left font-medium w-32">
                      Reps
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>

                <tbody>
                  {ex.sets.map((s, sIdx) => (
                    <tr
                      key={sIdx}
                      className={`${
                        sIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="py-2 px-3 font-medium">{s.set_no}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={s.weight === 0 ? "" : s.weight}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, "weight", e.target.value)
                          }
                          onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                          placeholder="-"
                          className="w-full rounded-lg px-3 py-1.5 border border-gray-200 
                                     focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={s.reps === 0 ? "" : s.reps}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, "reps", e.target.value)
                          }
                          onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                          placeholder="-"
                          className="w-full rounded-lg px-3 py-1.5 border border-gray-200 
                                     focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                        />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          onClick={() => removeSet(exIdx, sIdx)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-center text-red-600 text-sm font-medium mt-5">
          {error}
        </p>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-6 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-full 
                     text-sm shadow-sm transition font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-1.5 bg-green-600 hover:bg-green-500 text-white 
                     text-sm rounded-full shadow-md transition font-medium"
        >
          Save Template
        </button>
      </div>
      {showSelector && (
        <ExerciseSelector
          exerciseList={exerciseList}
          tempSelectedIds={tempSelectedIds}
          toggleSelectExercise={toggleSelectExercise}
          onConfirm={handleConfirmSelection}
          onCancel={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
