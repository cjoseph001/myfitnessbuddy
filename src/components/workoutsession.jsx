import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaTrash } from "react-icons/fa";
import WorkoutTable from "./workouttable";
import AddExerciseModal from "./addexercise";
import { API_BASE_URL } from "../config/api";

export default function WorkoutSessionCard({
  session,
  onDelete,
  onUpdate,
  exerciseList = [],
}) {
  if (!session) return null;

  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editableSession, setEditableSession] = useState(
    JSON.parse(JSON.stringify(session))
  );

  useEffect(() => {
    setEditableSession(JSON.parse(JSON.stringify(session)));
  }, [session]);

  const handleCancel = () => {
    setEditableSession(JSON.parse(JSON.stringify(session)));
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload = JSON.parse(JSON.stringify(editableSession));
      payload.name = payload.name?.trim() || "My Workout";
      payload.duration = Number(payload.duration) || 0;
      payload.exercises.forEach((ex) => {
        ex.sets?.forEach((s) => {
          s.reps = Number(s.reps) || 0;
          s.weight = Number(s.weight) || 0;
        });
      });

      const res = await fetch(`${API_BASE_URL}/api/sessions/id/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (!data.session) {
          onDelete?.(session.id);
        } else {
          onUpdate?.(data.session);
        }
        setIsEditing(false);
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An error occurred while saving");
    }
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const newExercises = JSON.parse(JSON.stringify(editableSession.exercises));
    const ex = newExercises[exerciseIndex];
    ex.sets.splice(setIndex, 1);
    ex.sets.forEach((s, i) => (s.set_no = i + 1));
    if (ex.sets.length === 0) newExercises.splice(exerciseIndex, 1);
    newExercises.forEach((ex, i) => (ex.order_no = i + 1));
    setEditableSession({ ...editableSession, exercises: newExercises });
  };

  const handleRemoveExercise = (exerciseIndex) => {
    const newExercises = JSON.parse(JSON.stringify(editableSession.exercises));
    newExercises.splice(exerciseIndex, 1);
    newExercises.forEach((ex, i) => (ex.order_no = i + 1));
    setEditableSession({ ...editableSession, exercises: newExercises });
  };

  const formattedDate = session.session_date
    ? (() => {
        const dateObj = new Date(session.session_date);
        const dayName = dateObj.toLocaleDateString("en-GB", {
          weekday: "long",
        });
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString("en-GB", { month: "long" });
        const year = dateObj.getFullYear();
        return `${dayName}, ${day} ${month} ${year}`;
      })()
    : "-";

  const totalExercises = editableSession.exercises?.length || 0;
  const totalSets = editableSession.exercises?.reduce(
    (sum, ex) => sum + (ex.sets?.length || 0),
    0
  );
  const totalReps = editableSession.exercises?.reduce(
    (sum, ex) =>
      sum + ex.sets?.reduce((rSum, s) => rSum + Number(s.reps || 0), 0),
    0
  );

  const visibleExercises = isEditing
    ? editableSession.exercises
    : expanded
    ? editableSession.exercises
    : editableSession.exercises?.slice(0, 0);

  const exerciseSummary = () => {
    if (!editableSession.exercises || editableSession.exercises.length === 0)
      return "";

    const names = editableSession.exercises.map((ex) => {
      return (
        exerciseList.find((e) => e.id === ex.exercise_id)?.name ||
        ex.session_exercise_name ||
        "Exercise"
      );
    });

    if (names.length <= 3) return names.join(", ");
    return names.slice(0, 3).join(", ") + ` ...+${names.length - 3}`;
  };

  return (
    <div className="max-w-6xl mx-auto relative bg-white rounded-2xl px-5 pt-3 pb-4.5 mb-5 shadow-sm transition-all duration-300 hover:shadow-md border border-gray-200">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {isEditing ? "Edit Workout" : session.name}
            </h3>
            {!isEditing && (
              <div className="mb-1 text-sm text-gray-500 font-medium">
                Session {session.session_no || 1}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5  text-xs  bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-500 transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2.5  py-1.5 text-xs bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="relative group px-3.5 py-1.5 text-xs font-semibold rounded-lg 
               bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md
               hover:from-blue-600 hover:to-blue-700
               transition-all duration-200 transform hover:scale-[1.03] active:scale-95"
                  >
                    <span className="relative z-10">Edit</span>
                    <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>

                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this session?"
                        )
                      ) {
                        const res = await fetch(
                          `${API_BASE_URL}/api/sessions/id/${session.id}`,
                          { method: "DELETE" }
                        );
                        const data = await res.json();
                        if (data.success) onDelete?.(data.sessions);
                      }
                    }}
                    className="relative group px-2.5 py-1.5  text-xs font-semibold rounded-lg 
               bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md
               hover:from-red-600 hover:to-red-700
               transition-all duration-200 transform hover:scale-[1.03] active:scale-95"
                  >
                    <span className="relative z-10">Delete</span>
                    <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          <>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-3 text-gray-700 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{session.start_time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaClock className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{session.duration} min</span>
              </div>
            </div>

            {!isEditing && !expanded && totalExercises > 0 && (
              <div className="text-sm text-gray-500 mb-5 px-1 truncate">
                {exerciseSummary()}
              </div>
            )}
            <div className="flex flex-wrap justify-between gap-4 bg-gray-50 rounded-xl p-4 sm:p-5 text-gray-700 mb-2 border border-gray-200 shadow-inner">
              {[
                { label: "Exercises", value: totalExercises },
                { label: "Sets", value: totalSets },
                { label: "Reps", value: totalReps },
                {
                  label: "Volume",
                  value:
                    (editableSession.exercises?.reduce(
                      (sum, ex) =>
                        sum +
                        ex.sets?.reduce(
                          (vSum, s) =>
                            vSum + Number(s.reps || 0) * Number(s.weight || 0),
                          0
                        ),
                      0
                    ) || 0) + " kg",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[70px] flex flex-col items-center"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                Workout Name
              </label>
              <input
                type="text"
                className="w-full text-sm sm:text-base px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
                placeholder="My Workout"
                value={editableSession.name}
                onChange={(e) =>
                  setEditableSession({
                    ...editableSession,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  className="w-full text-sm sm:text-base px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
                  value={editableSession.start_time || "07:00"}
                  onChange={(e) =>
                    setEditableSession({
                      ...editableSession,
                      start_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="w-32">
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  className="w-full text-sm sm:text-base px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
                  value={editableSession.duration || ""}
                  onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                  onChange={(e) =>
                    setEditableSession({
                      ...editableSession,
                      duration:
                        e.target.value === ""
                          ? ""
                          : Math.max(0, Number(e.target.value)),
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {(editableSession.exercises?.length || isEditing) > 0 ? (
          (isEditing ? editableSession.exercises : visibleExercises).map(
            (ex, idx) => {
              const exerciseName = !isEditing
                ? exerciseList.find((e) => e.id === ex.exercise_id)?.name ||
                  ex.session_exercise_name ||
                  "Exercise"
                : null;

              return (
                <div
                  key={ex.id || idx}
                  className="mt-4 border-t border-gray-200 pt-3 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    {!isEditing && (
                      <strong className="text-gray-800 text-sm sm:text-base">
                        {idx + 1}. {exerciseName}
                      </strong>
                    )}
                    {isEditing && (
                      <div className="flex flex-col w-full sm:w-auto gap-1">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">
                          Exercise Name
                        </label>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                          <select
                            value={ex.exercise_id || ""}
                            onChange={(e) => {
                              const selected = exerciseList.find(
                                (ae) => ae.id === Number(e.target.value)
                              );
                              const newExercises = JSON.parse(
                                JSON.stringify(editableSession.exercises)
                              );
                              newExercises[idx] = {
                                ...newExercises[idx],
                                exercise_id: selected.id,
                                name: selected.name,
                              };
                              setEditableSession({
                                ...editableSession,
                                exercises: newExercises,
                              });
                            }}
                            className="w-full sm:w-auto text-sm sm:text-base px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
                          >
                            <option value="">Select Exercise</option>
                            {exerciseList.map((ae) => (
                              <option key={ae.id} value={ae.id}>
                                {ae.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRemoveExercise(idx)}
                            title="Delete Exercise"
                            className="px-2 py-1 text-red-600 text-sm hover:bg-red-100 rounded-md transition"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <WorkoutTable
                    sets={ex.sets}
                    isEditing={isEditing}
                    onRemoveSet={(setIdx) => handleRemoveSet(idx, setIdx)}
                    onChangeSet={(setIdx, field, value) => {
                      const newExercises = JSON.parse(
                        JSON.stringify(editableSession.exercises)
                      );
                      newExercises[idx].sets[setIdx][field] = value;
                      setEditableSession({
                        ...editableSession,
                        exercises: newExercises,
                      });
                    }}
                  />

                  {isEditing && (
                    <div className="mt-1">
                      <button
                        onClick={() => {
                          const newExercises = JSON.parse(
                            JSON.stringify(editableSession.exercises)
                          );
                          const exItem = newExercises[idx];
                          const nextSetNo = (exItem.sets?.length || 0) + 1;
                          exItem.sets = exItem.sets || [];
                          exItem.sets.push({
                            set_no: nextSetNo,
                            weight: 0,
                            reps: 0,
                          });
                          setEditableSession({
                            ...editableSession,
                            exercises: newExercises,
                          });
                        }}
                        className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 font-semibold text-xs sm:text-sm rounded-lg shadow-sm hover:bg-green-200 transition-all duration-200"
                      >
                        + Add Set
                      </button>
                    </div>
                  )}
                </div>
              );
            }
          )
        ) : (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              No exercises recorded for this session.
            </p>
          </div>
        )}

        {isEditing && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAddExercise(true)}
              className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              + Add New Exercise
            </button>
          </div>
        )}

        {showAddExercise && (
          <AddExerciseModal
            exerciseList={exerciseList}
            onAdd={(selected) => {
              const newExercises = [...(editableSession.exercises || [])];
              selected.forEach((sel) => {
                newExercises.push({
                  id: null,
                  order_no: newExercises.length + 1,
                  exercise_id: sel.id,
                  session_exercise_name: sel.name,
                  sets: [{ set_no: 1, reps: 0, weight: 0 }],
                });
              });
              setEditableSession({
                ...editableSession,
                exercises: newExercises,
              });
              setShowAddExercise(false);
            }}
            onClose={() => setShowAddExercise(false)}
          />
        )}

        {!isEditing && session.exercises?.length >= 1 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full shadow-sm hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <span className="mr-2 font-semibold">
                {expanded ? "Hide Details" : "View Details"}
              </span>
              <span
                className={`inline-block transform transition-transform duration-300 ${
                  expanded ? "rotate-180" : "rotate-0"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
