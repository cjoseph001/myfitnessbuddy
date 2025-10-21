import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function WorkoutTemplateCard({ template, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5001/api/templates/${template.id}`
        );
        const data = await res.json();
        setExercises(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [template.id]);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };
  const subheaderText =
    exercises && exercises.length > 0
      ? exercises
          .slice(0, 3)
          .map((ex) => ex.name)
          .join(", ") +
        (exercises.length > 3 ? `, ${exercises.length - 3} more...` : "")
      : "";

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {template.title}
          </h3>
          {!expanded && subheaderText && (
            <p className="text-gray-500 text-sm mt-1">{subheaderText}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleExpand}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-xl shadow-sm transition-all duration-200 ${
              expanded
                ? "bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {expanded ? "Hide" : "Show"}
          </button>

          <button
            onClick={() => onDelete(template.id)}
            className="text-red-500 hover:text-red-800 transition-colors duration-200 px-1"
            title="Delete Template"
          >
            <TrashIcon className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3.5 border-t border-blue-100 pt-3">
          {loading ? (
            <p className="text-gray-500 text-sm text-center py-3">
              Loading exercises...
            </p>
          ) : !exercises || exercises.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-3">
              No exercises yet.
            </p>
          ) : (
            <div className="space-y-6">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.workout_exercise_id || ex.id || idx}
                  className="pb-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <p className="font-semibold text-gray-900 text-base">
                      {idx + 1}. {ex.name}
                    </p>
                    <div className="flex gap-1 mt-2 sm:mt-0 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                        {ex.muscle || "–"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                        {ex.equipment || "–"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                    {ex.sets?.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition"
                      >
                        <span className="text-gray-600 font-medium">
                          Set {s.set_no}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {s.weight === 0 ? "–" : s.weight} kg ×{" "}
                          {s.reps === 0 ? "–" : s.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
