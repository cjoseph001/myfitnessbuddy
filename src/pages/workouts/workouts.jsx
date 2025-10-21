import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "../../components/calendar";
import { AuthContext } from "../../context/authcontext";
import WorkoutSessionCard from "../../components/workoutsession";
import AddWorkoutForm from "../../components/addworkoutform";

export default function Workouts() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);

  useEffect(() => {
    if (date) {
      const yyyy = Number(date.slice(0, 4));
      const mm = Number(date.slice(4, 6)) - 1;
      const dd = Number(date.slice(6, 8));
      setSelectedDate(new Date(yyyy, mm, dd));
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      navigate(`/workouts/${yyyy}${mm}${dd}`, { replace: true });
    }
  }, [date, navigate]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/exercises");
        const data = await res.json();
        setExerciseList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExercises();
  }, []);

  const fetchSessions = async () => {
    if (!user) return;
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");

    try {
      const res = await fetch(
        `http://localhost:5001/api/sessions/date/${yyyy}${mm}${dd}?user_id=${user.id}`
      );
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedDate, user]);

  useEffect(() => {
    if (showExerciseModal) {
      const preSelectedIds = selectedExercises.map((ex) => ex.exercise_id);
      setTempSelectedIds(preSelectedIds);
    }
  }, [showExerciseModal, selectedExercises]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);

    setShowForm(false);
    setWorkoutName("");
    setStartTime("");
    setDuration("");
    setSelectedExercises([]);
    setTempSelectedIds([]);
    setShowExerciseModal(false);

    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    navigate(`/workouts/${yyyy}${mm}${dd}`);
  };

  const handleCreateWorkout = () => {
    setWorkoutName("");
    setStartTime("");
    setDuration("");
    setSelectedExercises([]);
    setTempSelectedIds([]);
    setShowExerciseModal(false);
    setShowForm(true);
  };
  const handleCloseForm = () => setShowForm(false);

  const toggleSelectExercise = (id) => {
    setTempSelectedIds((prev) => {
      const newState = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      return newState;
    });
  };

  const confirmSelectedExercises = () => {
    setSelectedExercises((prevSelected) => {
      const newSelected = exerciseList
        .filter((ex) => tempSelectedIds.includes(ex.id))
        .map((e) => {
          const existing = prevSelected.find((p) => p.exercise_id === e.id);
          return {
            exercise_id: e.id,
            name: e.name,
            muscle: e.muscle,
            equipment: e.equipment,
            order_no: existing ? existing.order_no : prevSelected.length + 1,
            sets: existing
              ? existing.sets
              : [{ set_no: 1, reps: "", weight: "" }],
          };
        });

      return newSelected;
    });

    setShowExerciseModal(false);
  };

  const addSet = (exIdx) => {
    setSelectedExercises((prev) => {
      const copy = [...prev];
      copy[exIdx].sets.push({
        set_no: copy[exIdx].sets.length + 1,
        reps: "",
        weight: "",
      });
      return copy;
    });
  };
  const updateSet = (exIdx, setIdx, field, value) => {
    setSelectedExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[exIdx].sets[setIdx][field] = value;
      return copy;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setSelectedExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));

      let removedExerciseId = null;

      if (copy[exIdx].sets.length === 1) {
        removedExerciseId = copy[exIdx].exercise_id;
        copy.splice(exIdx, 1);
      } else {
        copy[exIdx].sets.splice(setIdx, 1);
        copy[exIdx].sets.forEach((s, i) => (s.set_no = i + 1));
      }
      if (removedExerciseId) {
        setTempSelectedIds((prevIds) =>
          prevIds.filter((id) => id !== removedExerciseId)
        );
      }

      return copy;
    });
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exercise_id !== exerciseId)
    );
    setTempSelectedIds((prev) => prev.filter((id) => id !== exerciseId));
  };

  const handleSave = async () => {
    if (!user) return alert("Login required");

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");

    const payload = {
      user_id: user.id,
      session_date: `${yyyy}-${mm}-${dd}`,
      name: workoutName || "My Workout",
      start_time: startTime || "00:00",
      duration: duration ? Number(duration) : 0,
      exercises: selectedExercises.map((e, idx) => ({
        exercise_id: e.exercise_id,
        session_exercise_name: e.name,
        order_no: idx + 1,
        sets: e.sets.map((s) => ({
          set_no: s.set_no,
          reps: s.reps === "" || s.reps == null ? 0 : Number(s.reps),
          weight: s.weight === "" || s.weight == null ? 0 : Number(s.weight),
        })),
      })),
    };

    try {
      const res = await fetch("http://localhost:5001/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save session");

      alert("Workout saved!");
      setWorkoutName("");
      setStartTime("");
      setDuration("");
      setSelectedExercises([]);
      setShowForm(false);

      await fetchSessions();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  return (
    <div className="px-8 py-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            MyFitnessBuddy{" "}
            <span className="text-blue-600">Workout Manager</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-2 sm:mb-0">
            Log, review, and edit your training sessions here
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-semibold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{user?.email}</span>
            <span className="text-xs text-gray-500">Logged in User</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Calendar value={selectedDate} onChange={handleDateChange} />
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight leading-snug">
        {selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h1>
      {!showForm && sessions?.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleCreateWorkout}
            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm px-5 py-2 rounded-full shadow-md hover:from-blue-500 hover:to-blue-400 hover:shadow-lg transition-all duration-200"
          >
            + Add New Workout
          </button>
        </div>
      )}

      {showForm && (
        <AddWorkoutForm
          workoutName={workoutName}
          setWorkoutName={setWorkoutName}
          startTime={startTime}
          setStartTime={setStartTime}
          duration={duration}
          setDuration={setDuration}
          selectedExercises={selectedExercises}
          addSet={addSet}
          updateSet={updateSet}
          removeSet={removeSet}
          handleSave={handleSave}
          handleClose={handleCloseForm}
          showExerciseModal={showExerciseModal}
          setShowExerciseModal={setShowExerciseModal}
          exerciseList={exerciseList}
          tempSelectedIds={tempSelectedIds}
          toggleSelectExercise={toggleSelectExercise}
          confirmSelectedExercises={confirmSelectedExercises}
          removeExercise={removeExercise}
          user={user}
        />
      )}

      {sessions?.length
        ? [...sessions]
            .sort((a, b) => b.session_no - a.session_no)
            .map((session) => (
              <WorkoutSessionCard
                key={session.id}
                session={session}
                exerciseList={exerciseList}
                pageDate={selectedDate}
                onDelete={(updatedSessions) => setSessions(updatedSessions)}
                onUpdate={(updatedSession) => {
                  const newSessions = sessions.map((s) =>
                    s.id === updatedSession.id ? updatedSession : s
                  );
                  setSessions(newSessions);
                }}
              />
            ))
        : !showForm && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 6H22V18H20V6Z M2 6H4V18H2V6Z M6 10H18V14H6V10Z"
                />
              </svg>
              <h3 className="text-gray-700 text-lg font-semibold mb-2 text-center">
                No sessions today
              </h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Start logging your workouts and track your progress!
              </p>
              <button
                onClick={handleCreateWorkout}
                className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm px-6 py-2 rounded-full shadow-md hover:from-blue-500 hover:to-blue-400 hover:shadow-lg transition-all duration-200"
              >
                + Create New Workout
              </button>
            </div>
          )}
    </div>
  );
}
