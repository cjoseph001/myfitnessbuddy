import express from "express";
import { query } from "./db.js";
const router = express.Router();

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDatePretty(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeDateStr(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return formatDateISO(d);
}

router.get("/sessions", async (req, res) => {
  const { user_id, range, start_date, end_date } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  try {
    const params = [user_id];
    let dateFilterSql = "";
    let periodStart = null;
    let periodEnd = null;
    let periodLabel = "All Data";

    const todayISO = formatDateISO(new Date());

    if (start_date && end_date) {
      dateFilterSql = "AND s.session_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
      periodStart = start_date;
      periodEnd = end_date;
      periodLabel = `${formatDatePretty(start_date)} - ${formatDatePretty(
        end_date
      )}`;
    } else if (range === "today") {
      dateFilterSql = "AND s.session_date = ?";
      params.push(todayISO);
      periodStart = todayISO;
      periodEnd = todayISO;
      periodLabel = formatDatePretty(todayISO);
    } else if (range === "week") {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      periodStart = formatDateISO(start);
      periodEnd = todayISO;
      dateFilterSql = "AND s.session_date BETWEEN ? AND ?";
      params.push(periodStart, periodEnd);
      periodLabel = `${formatDatePretty(periodStart)} - ${formatDatePretty(
        periodEnd
      )}`;
    } else if (range === "month") {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      periodStart = formatDateISO(start);
      periodEnd = todayISO;
      dateFilterSql = "AND s.session_date BETWEEN ? AND ?";
      params.push(periodStart, periodEnd);
      periodLabel = `${formatDatePretty(periodStart)} - ${formatDatePretty(
        periodEnd
      )}`;
    } else if (range === "year") {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 365);
      periodStart = formatDateISO(start);
      periodEnd = todayISO;
      dateFilterSql = "AND s.session_date BETWEEN ? AND ?";
      params.push(periodStart, periodEnd);
      periodLabel = `${formatDatePretty(periodStart)} - ${formatDatePretty(
        periodEnd
      )}`;
    }

    const sessionsSql = `
      SELECT s.id, s.session_date, s.duration, s.start_time, s.name
      FROM sessions s
      WHERE s.user_id = ? ${dateFilterSql}
      ORDER BY s.session_date DESC, s.session_no DESC
    `;
    const sessions = await query(sessionsSql, params);

    for (const session of sessions) {
      const exercises = await query(
        `SELECT se.id AS session_exercise_id, se.session_exercise_name, e.name AS exercise_name, e.muscle
         FROM session_exercises se
         LEFT JOIN exercises e ON se.exercise_id = e.id
         WHERE se.session_id = ?
         ORDER BY se.order_no ASC`,
        [session.id]
      );

      for (const ex of exercises) {
        const sets = await query(
          "SELECT set_no, reps, weight FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
          [ex.session_exercise_id]
        );
        ex.sets = Array.isArray(sets) ? sets : [];
        ex.name = ex.exercise_name || ex.session_exercise_name || "Unknown";
        ex.muscle = ex.muscle || "Unknown";
      }

      session.exercises = Array.isArray(exercises) ? exercises : [];
    }

    if ((!periodStart || !periodEnd) && sessions.length > 0) {
      const newest = sessions[0].session_date;
      const oldest = sessions[sessions.length - 1].session_date;
      if (!periodStart) periodStart = oldest;
      if (!periodEnd) periodEnd = newest;
      periodLabel = `${formatDatePretty(periodStart)} - ${formatDatePretty(
        periodEnd
      )}`;
    }

    periodStart = normalizeDateStr(periodStart);
    periodEnd = normalizeDateStr(periodEnd);

    let totalWorkouts = sessions.length;
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    sessions.forEach((session) => {
      (session.exercises || []).forEach((ex) => {
        (ex.sets || []).forEach((s) => {
          totalSets++;
          totalReps += s.reps || 0;
          totalVolume += (s.reps || 0) * (s.weight || 0);
        });
      });
    });

    res.json({
      totalWorkouts,
      totalSets,
      totalReps,
      totalVolume,
      sessions,
      periodLabel,
      periodStart,
      periodEnd,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
