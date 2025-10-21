import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../../config/api";

export default function WorkoutTemplateCard({ template, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/templates/${template.id}`);
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

  const toggleExpand = () => setExpanded((prev) => !prev);

  const subheaderText =
    exercises && exercises.length > 0
      ? exercises
          .slice(0, 3)
          .map((ex) => ex.name)
          .join(", ") +
        (exercises.length > 3 ? `, +${exercises.length - 3} more` : "")
      : "";

  return (
    <article
      aria-labelledby={`template-${template.id}-title`}
      className="relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-300" />

      {/* Header */}
      <div className="flex items-start justify-between pb-4 pt-3.5 pr-3 pl-4.5">
        <div className="min-w-0 flex-1">
          <h3
            id={`template-${template.id}-title`}
            className="text-base font-semibold text-gray-900 truncate"
            title={template.title}
          >
            {template.title}
          </h3>

          {!expanded && subheaderText && (
            <p
              className="mt-1.5 text-xs text-gray-500 truncate"
              title={subheaderText}
            >
              {subheaderText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleExpand}
            className={`inline-flex items-center px-3 py-1 rounded-3xl text-xs font-medium transition-all ${
              expanded
                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {expanded ? "Hide" : "Show"}
          </button>

          <button
            onClick={() => onDelete(template.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
            title="Delete Template"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="border-t border-gray-200 px-4 pb-4 pt-3">
          {loading ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              Loading exercises...
            </p>
          ) : !exercises || exercises.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No exercises in this template.
            </p>
          ) : (
            <div className="space-y-3">
              {exercises.map((ex, idx) => {
                const name = ex.name || "Unnamed exercise";
                const muscle = ex.muscle || "";
                const equipment = ex.equipment || "";

                return (
                  <div
                    key={ex.workout_exercise_id || ex.id || idx}
                    className="group bg-white rounded-xl pt-3 pb-4 px-4 border border-gray-200 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold truncate flex items-center gap-1.5">
                          <span className="font-bold">{idx + 1}.</span>
                          <span>{name}</span>
                        </p>

                        {/* Badges */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-900">
                          {muscle && (
                            <span className="text-gray-700">{muscle}</span>
                          )}
                          {muscle && equipment && (
                            <span className="text-gray-400">•</span>
                          )}
                          {equipment && (
                            <span className="text-gray-600">{equipment}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sets Section */}
                    <div className="mt-3.5">
                      {ex.sets && ex.sets.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
                          {ex.sets.map((s, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 min-w-[100px] bg-gray-50 hover:bg-blue-50 transition-all duration-200"
                              title={`Set ${s.set_no}: ${s.weight || 0} kg × ${
                                s.reps || 0
                              }`}
                            >
                              <p className="text-xs text-gray-500 mb-0.5">
                                Set {s.set_no}
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {s.weight ? `${s.weight} kg` : "– kg"} ×{" "}
                                {s.reps || "–"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          No sets added
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
