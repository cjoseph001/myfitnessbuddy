import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authcontext";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import WorkoutTemplateForm from "../../components/template/workouttemplateform";
import WorkoutTemplatesSection from "../../components/template/workouttemplatesection";
import { API_BASE_URL } from "../../config/api";

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
    fetch(`${API_BASE_URL}/api/sessions/recent?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setRecentWorkouts)
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/api/templates?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/exercises`)
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
      await fetch(`${API_BASE_URL}/api/templates/${id}`, {
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

      const res = await fetch(`${API_BASE_URL}/api/templates`, {
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
    <div className="px-4 sm:px-8 pt-3 pb-10 sm:pt-5 sm:pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            MyFitnessBuddy <span className="text-blue-600">Home</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-2 sm:mb-0">
            Track your recent workouts and create workout templates here.
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
            className="px-4 py-2 text-base text-white font-bold rounded-2xl 
              bg-gradient-to-r from-blue-500 to-blue-600 shadow hover:from-blue-600 hover:to-blue-700 hover:shadow-md transition-all duration-200"
          >
            Create New Workout
          </button>
        </div>
      )}

      {/* Workout Templates Section */}
      <section className="mb-7.5 w-full max-w-none">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workout Templates</h2>
          {templates.length > 0 && (
            <button
              onClick={() => setShowTemplateForm(true)}
              className="px-2 py-1.25 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              + Add new
            </button>
          )}
        </div>

        {templates.length === 0 && !showTemplateForm && (
          <div className="p-6 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center flex flex-col items-center justify-center mt-2">
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

        {templates.length > 0 && (
          <>
            <p className="text-gray-500 text-sm mt-3">
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

      {/* Divider */}
      <div className="my-4 border-t border-gray-300"></div>

      <section>
        <h2 className="text-lg font-semibold">Recent Workouts</h2>
        {recentWorkouts.length > 0 && (
          <p className="text-gray-500 mb-5 text-sm">
            Show workouts from the last 7 days. Click view workout to see
            details on workouts page.
          </p>
        )}

        {recentWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 mt-2">
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
              console.log(
                "Exercises for session:",
                session.id,
                session.exercises
              );

              const summary = getWorkoutSummary(session);
              const formattedDate = formatDateDisplay(session.session_date);
              const linkDate = formatDateForLink(session.session_date);

              return (
                <div
                  key={session.id}
                  className="bg-white border border-gray-300 rounded-2xl pt-2.5 pb-3.5 px-4 shadow hover:shadow-xl transition-all duration-200 flex flex-col"
                >
                  <h3 className="text-base font-semibold text-gray-800 mb-1.5 truncate">
                    {session.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                    <FaCalendarAlt className="text-blue-400 w-3 h-3" />
                    <span>{formattedDate}</span>
                    <span className="text-gray-400">•</span>
                    <span>Session {session.session_no}</span>
                    <span className="text-gray-400">•</span>
                    <FaClock className="text-blue-400 w-3 h-3" />
                    <span>{session.start_time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4 overflow-hidden whitespace-nowrap text-ellipsis">
                    {session.exercises.slice(0, 2).map((ex, idx) => (
                      <span key={idx}>
                        {ex.session_exercise_name}
                        {idx < Math.min(session.exercises.length, 2) - 1
                          ? ","
                          : ""}
                      </span>
                    ))}
                    {session.exercises.length > 2 && (
                      <span> ...+{session.exercises.length - 2}</span>
                    )}
                  </div>
                  {/* Stats Card */}
                  <div className="grid grid-cols-4 bg-gradient-to-r from-blue-50 via-gray-50 to-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 text-center text-gray-800 mb-3 shadow-sm">
                    {[
                      { label: "Exercises", value: summary.exerciseCount },
                      { label: "Sets", value: summary.totalSets },
                      { label: "Reps", value: summary.totalReps },
                      { label: "Volume", value: summary.totalVolume },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center"
                      >
                        <span className="text-base font-extrabold text-gray-900">
                          {stat.value}
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => navigate(`/workouts/${linkDate}`)}
                    className="w-full text-sm py-1.5 mt-1 bg-white text-blue-600 font-semibold rounded-2xl border border-blue-100 shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                  >
                    View Workout
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
