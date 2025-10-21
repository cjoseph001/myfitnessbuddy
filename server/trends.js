import express from "express";
import { query } from "./db.js";

const router = express.Router();

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatDate = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatWeekLabel = (start) => {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opt = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-GB", opt)} - ${end.toLocaleDateString(
    "en-GB",
    opt
  )}`;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const formatMonthLabel = (date) => {
  const d = new Date(date);
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};

router.get("/weekly", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const sessions = await query(
      `SELECT id, session_date, duration FROM sessions 
       WHERE user_id = ? ORDER BY session_date ASC`,
      [userId]
    );
    if (!sessions.length) return res.json({ weeklyData: [] });

    const weekMap = new Map();
    const allMuscles = new Set();

    for (const session of sessions) {
      const weekStart = getWeekStart(session.session_date);
      const weekKey = formatDate(weekStart);
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekLabel: formatWeekLabel(weekStart),
          count: 0,
          totalVolume: 0,
          totalDuration: 0,
          muscleVolumes: {},
        });
      }

      const w = weekMap.get(weekKey);
      w.count += 1;
      w.totalDuration += session.duration || 0;

      const exercises = await query(
        `SELECT se.id AS sid, e.muscle 
         FROM session_exercises se
         LEFT JOIN exercises e ON e.id = se.exercise_id
         WHERE se.session_id = ?`,
        [session.id]
      );

      for (const ex of exercises) {
        const sets = await query(
          `SELECT reps, weight FROM exercise_sets WHERE session_exercise_id = ?`,
          [ex.sid]
        );

        let vol = 0;
        for (const s of sets) vol += (s.reps || 0) * (s.weight || 0);
        const m = ex.muscle || "Unknown";
        allMuscles.add(m);
        w.muscleVolumes[m] = (w.muscleVolumes[m] || 0) + vol;
        w.totalVolume += vol;
      }
    }

    const first = getWeekStart(sessions[0].session_date);
    const today = new Date();
    const data = [];
    let cur = new Date(first);

    while (cur <= today) {
      const key = formatDate(cur);
      if (weekMap.has(key)) data.push(weekMap.get(key));
      else
        data.push({
          weekLabel: formatWeekLabel(cur),
          count: 0,
          totalVolume: 0,
          totalDuration: 0,
          muscleVolumes: {},
        });
      cur.setDate(cur.getDate() + 7);
    }

    const weeklyData = data.map((w) => {
      for (const m of allMuscles) {
        if (!(m in w.muscleVolumes)) w.muscleVolumes[m] = 0;
      }
      return w;
    });

    res.json({ weeklyData });
  } catch (err) {
    console.error("Weekly trends error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/monthly", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const sessions = await query(
      `SELECT id, session_date, duration FROM sessions 
       WHERE user_id = ? ORDER BY session_date ASC`,
      [userId]
    );
    if (!sessions.length) return res.json({ monthlyData: [] });

    const monthMap = new Map();
    const allMuscles = new Set();

    for (const s of sessions) {
      const d = new Date(s.session_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          monthLabel: formatMonthLabel(d),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          count: 0,
          totalVolume: 0,
          totalDuration: 0,
          muscleVolumes: {},
        });
      }
      const mobj = monthMap.get(key);
      mobj.count += 1;
      mobj.totalDuration += s.duration || 0;

      const exercises = await query(
        `SELECT se.id AS sid, e.muscle 
         FROM session_exercises se
         LEFT JOIN exercises e ON e.id = se.exercise_id
         WHERE se.session_id = ?`,
        [s.id]
      );

      for (const ex of exercises) {
        const sets = await query(
          `SELECT reps, weight FROM exercise_sets WHERE session_exercise_id = ?`,
          [ex.sid]
        );

        let vol = 0;
        for (const ss of sets) vol += (ss.reps || 0) * (ss.weight || 0);
        const muscle = ex.muscle || "Unknown";
        allMuscles.add(muscle);
        mobj.muscleVolumes[muscle] = (mobj.muscleVolumes[muscle] || 0) + vol;
        mobj.totalVolume += vol;
      }
    }
    const first = new Date(sessions[0].session_date);
    const today = new Date();
    const startYear = first.getFullYear();
    const startMonth = first.getMonth() + 1;
    const endYear = today.getFullYear();
    const endMonth = today.getMonth() + 1;

    const monthlyData = [];
    for (let y = startYear; y <= endYear; y++) {
      const startM = y === startYear ? startMonth : 1;
      const lastM = y === endYear ? endMonth : 12;
      for (let m = startM; m <= lastM; m++) {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        if (monthMap.has(key)) monthlyData.push(monthMap.get(key));
        else
          monthlyData.push({
            monthLabel: `${monthNames[m - 1]} ${y}`,
            year: y,
            month: m,
            count: 0,
            totalVolume: 0,
            totalDuration: 0,
            muscleVolumes: {},
          });
      }
    }

    for (const mobj of monthlyData) {
      for (const m of allMuscles) {
        if (!(m in mobj.muscleVolumes)) mobj.muscleVolumes[m] = 0;
      }
    }
    res.json({ monthlyData });
  } catch (err) {
    console.error("Monthly trends error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
