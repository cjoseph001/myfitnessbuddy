import { Trash2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function WorkoutTable({
  sets = [],
  isEditing = false,
  onRemoveSet,
  onChangeSet,
}) {
  const [localSets, setLocalSets] = useState([]);

  useEffect(() => {
    setLocalSets(
      (sets || []).map((s, i) => ({
        set_no: i + 1,
        reps: s.reps && s.reps !== 0 ? s.reps.toString() : "",
        weight: s.weight && s.weight !== 0 ? s.weight.toString() : "",
        id: s.id,
      }))
    );
  }, [sets]);

  const handleChange = (idx, field, value) => {
    if (value === "0") value = "";

    const newSets = [...localSets];
    newSets[idx][field] = value;
    setLocalSets(newSets);
    const numericValue = value === "" ? 0 : Math.max(0, Number(value));
    onChangeSet?.(idx, field, numericValue);
  };

  const handleRemove = (idx) => {
    const newSets = [...localSets];
    newSets.splice(idx, 1);
    newSets.forEach((s, i) => (s.set_no = i + 1));
    setLocalSets(newSets);
    onRemoveSet?.(idx);
  };

  return (
    <div className="overflow-x-auto mt-3 relative">
      <table className="w-full text-sm border-collapse shadow-md rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left font-medium">Set</th>
            <th className="py-3 px-4 text-left font-medium">Weight (kg)</th>
            <th className="py-3 px-4 text-left font-medium">Reps</th>
          </tr>
        </thead>
        <tbody>
          {localSets.map((s, idx) => (
            <tr
              key={s.id || idx}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-gray-100 transition relative`}
            >
              <td className="py-3 px-4 font-medium text-gray-800">
                {s.set_no}
              </td>

              <td className="py-3 px-4">
                {isEditing ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={s.weight === 0 || s.weight === "0" ? "" : s.weight}
                    placeholder="-"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    onChange={(e) =>
                      handleChange(idx, "weight", e.target.value)
                    }
                    className="w-20 px-2 py-1 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition"
                  />
                ) : (
                  <span className="text-gray-700">{s.weight || 0}</span>
                )}
              </td>

              <td className="py-3 px-4">
                {isEditing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={s.reps === 0 || s.reps === "0" ? "" : s.reps}
                    placeholder="-"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    onChange={(e) => handleChange(idx, "reps", e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition"
                  />
                ) : (
                  <span className="text-gray-700">{s.reps || 0}</span>
                )}
              </td>

              {isEditing && (
                <td className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-red-600 hover:text-red-800 transition p-1 rounded-full"
                  >
                    <Trash2Icon size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
