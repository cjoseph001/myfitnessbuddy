import React, { useState, useEffect } from "react";
import ExerciseSelector from "./exerciseselector";
import { TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config/api";

export default function AddWorkoutForm({
  workoutName,
  setWorkoutName,
  startTime,
  setStartTime,
  duration,
  setDuration,
  selectedExercises,
  addSet,
  updateSet,
  removeSet,
  handleSave,
  handleClose,
  showExerciseModal,
  setShowExerciseModal,
  exerciseList,
  tempSelectedIds,
  toggleSelectExercise,
  confirmSelectedExercises,
  removeExercise,
  user,
}) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [expandedTemplates, setExpandedTemplates] = useState({});
  useEffect(() => {
    if (showTemplateModal && user) {
      const fetchTemplates = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/templates?user_id=${user.id}`
          );
          const templatesData = await res.json();

          const templatesWithExercises = await Promise.all(
            templatesData.map(async (t) => {
              const resEx = await fetch(
                `${API_BASE_URL}/api/templates/${t.id}`
              );
              const exercises = await resEx.json();
              return { ...t, exercises };
            })
          );

          setTemplates(templatesWithExercises);
        } catch (err) {
          console.error("Failed to fetch templates:", err);
        }
      };
      fetchTemplates();
    }
  }, [showTemplateModal, user]);

  const handleTemplateConfirm = () => {
    if (!selectedTemplateId) return alert("Select a template first");
    const template = templates.find((t) => t.id === selectedTemplateId);
    setSelectedTemplateData(template);

    selectedExercises.length = 0;
    if (template?.exercises) {
      template.exercises.forEach((ex) => {
        selectedExercises.push({ ...ex });
      });
    }

    setShowTemplateModal(false);
  };

  return (
    <div className="bg-white rounded-2xl px-5 pt-3 pb-5 mb-7 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Create Workout</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
        <div className="md:col-span-3">
          <label
            htmlFor="workoutName"
            className="block text-sm text-gray-600 mb-1.5"
          >
            Workout Name
          </label>
          <input
            type="text"
            id="workoutName"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full text-base border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="e.g., Push Workout"
          />
        </div>

        <div className="relative w-full">
          <label
            htmlFor="startTime"
            className="block text-sm text-gray-600 mb-1.5"
          >
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="duration"
            className="block text-sm text-gray-600 mb-1.5"
          >
            Duration (mins)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border border-gray-300 text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="e.g., 45"
          />
        </div>

        <div className="md:col-span-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="font-semibold flex-1 text-sm bg-green-100 hover:bg-green-100 text-green-700 font-medium px-5 py-1.75 rounded-xl shadow-sm border border-green-100 hover:shadow-md hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Apply Template
          </button>

          <button
            onClick={() => setShowExerciseModal(true)}
            className="font-semibold flex-1 text-sm bg-blue-100 hover:bg-blue-100 text-blue-700 font-medium px-5 py-1.75 rounded-xl shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Select Exercises
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {selectedExercises.map((ex, exIdx) => (
          <div
            key={ex.exercise_id}
            className="border border-blue-100 rounded-xl px-5 py-4 transition-all duration-200 ease-in-out hover:shadow-md hover:border-blue-200"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900 mb-3.5">
                {ex.name}
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={() => addSet(exIdx)}
                  className="text-xs px-2 py-1.5 bg-blue-50 text-blue-700 rounded-full shadow-sm hover:bg-blue-100 hover:shadow-md transition flex items-center justify-center"
                >
                  + Set
                </button>
                <button
                  onClick={() => removeExercise(ex.exercise_id)}
                  className="text-xs px-2.5 py-1.5 bg-red-50 text-red-700 rounded-full shadow-sm hover:bg-red-100 hover:shadow-md transition flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3.5">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                {ex.muscle}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                {ex.equipment}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 w-16 text-left font-medium text-gray-700">
                      Set
                    </th>
                    <th className="py-2 px-3 w-32 text-left font-medium text-gray-700">
                      Weight (kg)
                    </th>
                    <th className="py-2 px-3 w-32 text-left font-medium text-gray-700">
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
                      } hover:bg-gray-100 transition rounded-xl`}
                    >
                      <td className="py-2 px-3 text-left font-medium">
                        {s.set_no}
                      </td>
                      <td className="py-2 px-3 text-left">
                        <input
                          type="number"
                          value={s.weight > 0 ? s.weight : ""}
                          placeholder="-"
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, "weight", e.target.value)
                          }
                          className="text-base w-full rounded-lg px-3 py-1 border border-gray-200 focus:ring-1 focus:ring-blue-300 focus:outline-none transition"
                        />
                      </td>
                      <td className="py-2 px-3 text-left">
                        <input
                          type="number"
                          value={s.reps > 0 ? s.reps : ""}
                          placeholder="-"
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, "reps", e.target.value)
                          }
                          className="text-base w-full rounded-lg px-3 py-1 border border-gray-200 focus:ring-1 focus:ring-blue-300 focus:outline-none transition"
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
      <div className="flex justify-end space-x-3 mt-7">
        <button
          onClick={handleClose}
          className="px-6 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-full text-sm shadow-sm transition font-medium"
        >
          Close
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-1.5 bg-blue-700 hover:bg-blue-500 text-white text-sm rounded-full shadow-md transition font-medium"
        >
          Save
        </button>
      </div>
      {showExerciseModal && (
        <ExerciseSelector
          exerciseList={exerciseList}
          tempSelectedIds={tempSelectedIds}
          toggleSelectExercise={toggleSelectExercise}
          onConfirm={confirmSelectedExercises}
          onCancel={() => setShowExerciseModal(false)}
        />
      )}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-5 py-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Select Workout Template
            </h3>
            {templates.length > 0 ? (
              <p className="text-sm text-gray-500 mb-4">
                Selecting a template will reset your current exercises and load
                the new template’s exercises and sets.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-7.5">
                {" "}
                No template found.
              </p>
            )}

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {templates.length === 0 ? (
                <>
                  <p className="text-gray-500 text-sm">
                    Create templates on home page to quickly load your favorite
                    workouts.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="px-3.5 py-1.5 text-sm rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Go to Home
                  </button>
                </>
              ) : (
                templates.map((t) => {
                  const isExpanded = expandedTemplates[t.id] || false;
                  const exercisesPreview = t.exercises?.slice(0, 3) || [];
                  const extraCount = t.exercises
                    ? Math.max(t.exercises.length - 3, 0)
                    : 0;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl cursor-pointer transition flex flex-col gap-2
              ${
                selectedTemplateId === t.id
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
                      onClick={() => setSelectedTemplateId(t.id)}
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {t.title}
                        </h4>
                        {!isExpanded && (
                          <p className="text-sm text-gray-600">
                            {exercisesPreview.map((ex) => ex.name).join(", ")}
                            {extraCount > 0 ? ` and ${extraCount} more` : ""}
                          </p>
                        )}
                      </div>

                      {t.exercises?.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTemplates((prev) => ({
                              ...prev,
                              [t.id]: !prev[t.id],
                            }));
                          }}
                          className=" text-xs text-blue-600 hover:underline self-start"
                        >
                          {isExpanded ? "Hide Details" : "Show Details"}
                        </button>
                      )}

                      {isExpanded && t.exercises?.length > 0 && (
                        <div className="mt-1 space-y-2">
                          {t.exercises.map((ex, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <h5 className="text-gray-800 font-medium text-sm">
                                {ex.name}
                              </h5>
                              <div className="flex flex-col gap-1 text-gray-600 text-xs">
                                {ex.sets?.length > 0 ? (
                                  ex.sets.map((s, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex justify-between"
                                    >
                                      <span className="font-medium">
                                        Set {s.set_no}:
                                      </span>
                                      <span>
                                        {s.weight > 0 ? s.weight : "-"} kg ×{" "}
                                        {s.reps > 0 ? s.reps : "-"} reps
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">
                                    No sets available
                                  </span>
                                )}
                              </div>
                              {idx < t.exercises.length - 1 && (
                                <hr className="border-t border-gray-200 mt-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              {templates.length > 0 && (
                <button
                  onClick={handleTemplateConfirm}
                  className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-500 text-white text-sm font-medium"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
