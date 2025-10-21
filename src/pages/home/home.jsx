import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authcontext";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import WorkoutTemplateForm from "../../components/template/workouttemplateform";
import WorkoutTemplatesSection from "../../components/template/workouttemplatesection";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [exerciseList, setExerciseList] = useState([]);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:5001/api/sessions/recent?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setRecentWorkouts)
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:5001/api/templates?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    fetch("http://localhost:5001/api/exercises")
      .then((res) => res.json())
      .then(setExerciseList)
      .catch(console.error);
  }, []);

  const handleAddWorkout = () => {
    const today = new Date();
    const yyyymmdd = today.toISOString().split("T")[0].replace(/-/g, "");
    navigate(`/workouts/${yyyymmdd}`);
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/templates/${id}`, {
        method: "DELETE",
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveTemplate = async (newTemplate) => {
    try {
      const payload = {
        user_id: user.id,
        title: newTemplate.title,
        exercises: newTemplate.exercises.map((ex, i) => ({
          exercise_id: ex.id,
          name: ex.name,
          sets: ex.sets || [{ set_no: 1, reps: 0, weight: 0 }],
          order_no: i + 1,
        })),
      };

      const res = await fetch("http://localhost:5001/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setTemplates((prev) => [
          { id: data.template_id, title: newTemplate.title },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Workout summary
  const getWorkoutSummary = (session) => {
    let totalSets = 0,
      totalReps = 0,
      totalVolume = 0;
    session.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        totalSets++;
        totalReps += s.reps || 0;
        totalVolume += (s.weight || 0) * (s.reps || 0);
      });
    });
    return {
      totalSets,
      totalReps,
      totalVolume,
      exerciseCount: session.exercises?.length || 0,
    };
  };

  const formatDateForLink = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatDateDisplay = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return "Invalid Date";
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="py-5 px-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            MyFitnessBuddy <span className="text-blue-600">Home</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-2 sm:mb-0">
            Track your recent workouts and create workout template here.
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

      {recentWorkouts.length > 0 && (
        <div className="flex gap-4 mb-5 flex-wrap">
          <button
            onClick={handleAddWorkout}
            className="px-4 py-2 text-base bg-blue-600 text-white font-bold rounded-2xl shadow hover:bg-blue-700 hover:shadow-md transition-all duration-200"
          >
            Create New Workout
          </button>
        </div>
      )}

      <section className="mb-7 w-full max-w-none">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold"> Workout Templates</h2>

          {templates.length > 0 && (
            <button
              onClick={() => setShowTemplateForm(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              + Add new
            </button>
          )}
        </div>

        {templates.length === 0 && !showTemplateForm && (
          <div className="p-6 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-3 text-2xl font-bold">
              +
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              You haven’t created any templates yet
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Start by adding one to create your favorite routine. Use templates
              on workouts page.
            </p>
            <button
              onClick={() => setShowTemplateForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              + Create First Template
            </button>
          </div>
        )}

        {showTemplateForm && (
          <WorkoutTemplateForm
            exerciseList={exerciseList}
            onClose={() => setShowTemplateForm(false)}
            onSave={handleSaveTemplate}
          />
        )}

        {/* --- Show Templates --- */}
        {templates.length > 0 && (
          <>
            <p className="text-gray-500 text-sm">
              You currently have {templates.length} template
              {templates.length !== 1 ? "s" : ""}. Click add new to create
              template.
            </p>

            <WorkoutTemplatesSection
              templates={showAllTemplates ? templates : templates.slice(0, 3)}
              onDelete={handleDeleteTemplate}
            />

            {templates.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllTemplates((prev) => !prev)}
                  className="group px-5 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:shadow-sm transition-all flex items-center gap-2"
                >
                  {showAllTemplates ? (
                    <>
                      <span>Show less templates</span>
                      <span className="text-blue-400 group-hover:translate-y-[-2px] transition-transform">
                        ▲
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Show {templates.length - 3} more template
                        {templates.length - 3 > 1 ? "s" : ""}
                      </span>
                      <span className="text-blue-400 group-hover:translate-y-[2px] transition-transform">
                        ▼
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3"> Recent Workouts</h2>
        {recentWorkouts.length > 0 && (
          <p className="text-gray-500 mb-5 text-sm">
            Show workouts from the last 7 days.{" "}
            {recentWorkouts.length > 0
              ? "Click view exercises to see details on workouts page"
              : ""}
          </p>
        )}

        {recentWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-3">
              <FaCalendarAlt className="text-2xl" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No recent workouts found
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Start your fitness journey today by logging your first workout!
            </p>
            <button
              onClick={handleAddWorkout}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              + Add New Workout
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {recentWorkouts.map((session) => {
              const summary = getWorkoutSummary(session);
              const formattedDate = formatDateDisplay(session.session_date);
              const linkDate = formatDateForLink(session.session_date);

              return (
                <div
                  key={session.id}
                  className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                    {session.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
                    <FaCalendarAlt className="text-blue-400 w-3 h-3" />
                    <span>{formattedDate}</span>
                    <span className="text-gray-400">•</span>
                    <span>Session {session.session_no}</span>
                    <span className="text-gray-400">•</span>
                    <FaClock className="text-blue-400 w-3 h-3" />
                    <span>{session.start_time}</span>
                  </div>

                  <div className="flex flex-wrap justify-between bg-gray-50 rounded-2xl p-3 sm:p-4 text-gray-700 mb-2">
                    {[
                      { label: "Exercises", value: summary.exerciseCount },
                      { label: "Sets", value: summary.totalSets },
                      { label: "Reps", value: summary.totalReps },
                      { label: "Volume", value: summary.totalVolume },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center px-2 sm:px-4"
                      >
                        <span className="text-base font-semibold text-gray-900">
                          {stat.value}
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/workouts/${linkDate}`)}
                    className="w-full text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-full shadow-sm hover:bg-blue-100 transition-all py-2"
                  >
                    View Exercises
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
