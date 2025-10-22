import express from "express";
import cors from "cors";
import { query } from "./db.js";
import { compare } from "bcrypt";
import { hash } from "bcrypt";
import analyticRouter from "./analytics.js";
import trendsRouter from "./trends.js";
import templateRouter from "./template.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "*" }));

app.use(express.json());

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 1️⃣ Find user by email
    const [user] = await query(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 2️⃣ Compare password with hashed password
    const isMatch = await compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3️⃣ Return user info (without password) to frontend
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    // 1️⃣ Check if email already exists
    const [existing] = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await hash(password, 10);

    // 3️⃣ Insert user
    const result = await query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashedPassword]
    );

    // 4️⃣ Return created user (without password)
    const [newUser] = await query("SELECT id, email FROM users WHERE id = ?", [
      result.insertId,
    ]);

    res.json({ user: newUser, message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/sessions/recent", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  try {
    // Get today's date and date 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // includes today

    const formattedToday = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const formatted7DaysAgo = sevenDaysAgo.toISOString().split("T")[0];

    const sessions = await query(
      `SELECT * FROM sessions 
         WHERE user_id = ? AND session_date BETWEEN ? AND ? 
         ORDER BY session_date DESC, session_no ASC`,
      [user_id, formatted7DaysAgo, formattedToday]
    );

    // Attach exercises + sets
    for (const session of sessions) {
      const exercises = await query(
        "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_no ASC",
        [session.id]
      );
      for (const ex of exercises) {
        const sets = await query(
          "SELECT * FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
          [ex.id]
        );
        ex.sets = sets;
      }
      session.exercises = exercises;
    }

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching recent sessions:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/sessions/date/:date", async (req, res) => {
  const { date } = req.params; // format: YYYYMMDD
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  try {
    const yyyy = date.slice(0, 4);
    const mm = date.slice(4, 6);
    const dd = date.slice(6, 8);
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const sessions = await query(
      "SELECT * FROM sessions WHERE user_id = ? AND session_date = ? ORDER BY session_no ASC",
      [user_id, formattedDate]
    );

    for (const session of sessions) {
      const exercises = await query(
        "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_no ASC",
        [session.id]
      );

      for (const ex of exercises) {
        const sets = await query(
          "SELECT * FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
          [ex.id]
        );
        ex.sets = sets;
      }

      session.exercises = exercises;
    }

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/sessions", async (req, res) => {
  const { user_id, session_date, name, start_time, duration, exercises } =
    req.body;

  if (!user_id || !session_date)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // 1️⃣ Determine session_no for that date
    const [countRow] = await query(
      "SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND session_date = ?",
      [user_id, session_date]
    );
    const session_no = countRow.count + 1;

    // 2️⃣ Insert new session
    const result = await query(
      "INSERT INTO sessions (user_id, session_date, session_no, name, start_time, duration) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, session_date, session_no, name, start_time, duration]
    );

    const session_id = result.insertId;

    // 3️⃣ Insert exercises and sets
    for (const e of exercises) {
      const exRes = await query(
        "INSERT INTO session_exercises (session_id, exercise_id, order_no, session_exercise_name) VALUES (?, ?, ?, ?)",
        [session_id, e.exercise_id, e.order_no, e.session_exercise_name]
      );

      const session_exercise_id = exRes.insertId;

      for (const s of e.sets) {
        await query(
          "INSERT INTO exercise_sets (session_exercise_id, set_no, reps, weight) VALUES (?, ?, ?, ?)",
          [session_exercise_id, s.set_no, s.reps, s.weight]
        );
      }
    }

    // 4️⃣ Re-fetch the newly created session (with exercises + sets)
    const [newSession] = await query("SELECT * FROM sessions WHERE id = ?", [
      session_id,
    ]);

    const sessionExercises = await query(
      "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_no ASC",
      [session_id]
    );

    for (const ex of sessionExercises) {
      const sets = await query(
        "SELECT * FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
        [ex.id]
      );
      ex.sets = sets;
    }

    newSession.exercises = sessionExercises;

    // ✅ Return full session object for frontend
    res.json({ message: "Session created successfully", session: newSession });
  } catch (err) {
    console.error("Error saving session:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/exercises", async (req, res) => {
  try {
    const exercises = await query("SELECT * FROM exercises ORDER BY name ASC");
    res.json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/sessions/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get the session info before deleting
    const [session] = await query("SELECT * FROM sessions WHERE id = ?", [id]);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    const { user_id, session_date, session_no } = session;

    // 2️⃣ Get all exercise IDs for this session
    const exerciseRows = await query(
      "SELECT id FROM session_exercises WHERE session_id = ?",
      [id]
    );
    const exerciseIds = exerciseRows.map((ex) => ex.id);

    // 3️⃣ Delete all sets for these exercises
    if (exerciseIds.length > 0) {
      const placeholders = exerciseIds.map(() => "?").join(",");
      await query(
        `DELETE FROM exercise_sets WHERE session_exercise_id IN (${placeholders})`,
        exerciseIds
      );
    }

    // 4️⃣ Delete exercises
    await query("DELETE FROM session_exercises WHERE session_id = ?", [id]);

    // 5️⃣ Delete the session itself
    await query("DELETE FROM sessions WHERE id = ?", [id]);

    // 6️⃣ Renumber remaining sessions for this user and date
    await query(
      `UPDATE sessions 
           SET session_no = session_no - 1 
           WHERE user_id = ? AND session_date = ? AND session_no > ?`,
      [user_id, session_date, session_no]
    );

    // 7️⃣ Fetch updated sessions with exercises + sets, latest first
    const sessions = await query(
      "SELECT * FROM sessions WHERE user_id = ? AND session_date = ? ORDER BY session_no DESC",
      [user_id, session_date]
    );

    // Attach exercises + sets for each session
    for (const s of sessions) {
      const exercises = await query(
        "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_no ASC",
        [s.id]
      );
      for (const ex of exercises) {
        const sets = await query(
          "SELECT * FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
          [ex.id]
        );
        ex.sets = sets;
      }
      s.exercises = exercises;
    }

    // 8️⃣ Return full updated sessions to frontend
    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
      sessions, // updated sessions with exercises + sets
    });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ success: false, error: "Failed to delete session" });
  }
});

app.put("/api/sessions/id/:id", async (req, res) => {
  const { id } = req.params;
  const { name, start_time, duration, exercises } = req.body;

  try {
    // 1️⃣ Update session info
    await query(
      "UPDATE sessions SET name = ?, start_time = ?, duration = ? WHERE id = ?",
      [name || "My Workout", start_time, duration || 0, id]
    );

    // 2️⃣ Fetch existing exercises
    const existingExercises = await query(
      "SELECT id FROM session_exercises WHERE session_id = ?",
      [id]
    );
    const existingExerciseIds = existingExercises.map((e) => e.id);

    const incomingExerciseIds = (exercises || [])
      .map((e) => e.id)
      .filter(Boolean);

    // 3️⃣ Delete removed exercises and their sets
    const exercisesToDelete = existingExerciseIds.filter(
      (exId) => !incomingExerciseIds.includes(exId)
    );
    if (exercisesToDelete.length > 0) {
      await query(
        `DELETE FROM exercise_sets WHERE session_exercise_id IN (${exercisesToDelete
          .map(() => "?")
          .join(",")})`,
        exercisesToDelete
      );
      await query(
        `DELETE FROM session_exercises WHERE id IN (${exercisesToDelete
          .map(() => "?")
          .join(",")})`,
        exercisesToDelete
      );
    }

    // 4️⃣ Upsert exercises and sets
    for (const [idx, e] of (exercises || []).entries()) {
      let exId = e.id;

      if (exId) {
        await query(
          "UPDATE session_exercises SET order_no = ?, exercise_id = ?, session_exercise_name = ? WHERE id = ?",
          [idx + 1, e.exercise_id || null, e.session_exercise_name || "", exId]
        );
      } else {
        const exRes = await query(
          "INSERT INTO session_exercises (session_id, order_no, session_exercise_name, exercise_id) VALUES (?, ?, ?, ?)",
          [id, idx + 1, e.session_exercise_name || "", e.exercise_id || null]
        );
        exId = exRes.insertId;
        e.id = exId;
      }

      // Fetch existing sets
      const existingSets = await query(
        "SELECT id FROM exercise_sets WHERE session_exercise_id = ?",
        [exId]
      );
      const existingSetIds = existingSets.map((s) => s.id);
      const incomingSetIds = (e.sets || []).map((s) => s.id).filter(Boolean);

      // Delete removed sets
      const setsToDelete = existingSetIds.filter(
        (id) => !incomingSetIds.includes(id)
      );
      if (setsToDelete.length > 0) {
        await query(
          `DELETE FROM exercise_sets WHERE id IN (${setsToDelete
            .map(() => "?")
            .join(",")})`,
          setsToDelete
        );
      }

      // Insert/update sets
      for (const [sIdx, s] of (e.sets || []).entries()) {
        const repsNum = Math.max(0, Number(s.reps) || 0);
        const weightNum = Math.max(0, Number(s.weight) || 0);

        if (s.id) {
          await query(
            "UPDATE exercise_sets SET reps = ?, weight = ?, set_no = ? WHERE id = ?",
            [repsNum, weightNum, sIdx + 1, s.id]
          );
        } else {
          const setRes = await query(
            "INSERT INTO exercise_sets (session_exercise_id, set_no, reps, weight) VALUES (?, ?, ?, ?)",
            [exId, sIdx + 1, repsNum, weightNum]
          );
          s.id = setRes.insertId;
        }
      }
    }

    // 5️⃣ Fetch updated session with exercises and sets
    const remainingExercises = await query(
      "SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_no ASC",
      [id]
    );

    for (const ex of remainingExercises) {
      const sets = await query(
        "SELECT * FROM exercise_sets WHERE session_exercise_id = ? ORDER BY set_no ASC",
        [ex.id]
      );
      ex.sets = sets.map((s, idx) => ({
        id: s.id,
        set_no: idx + 1,
        reps: s.reps ?? 0,
        weight: s.weight ?? 0,
      }));
    }

    const [updatedSession] = await query(
      "SELECT * FROM sessions WHERE id = ?",
      [id]
    );
    updatedSession.exercises = remainingExercises;

    res.json({ success: true, session: updatedSession });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ success: false, error: "Failed to update session" });
  }
});

app.use("/api/analytics", analyticRouter);
app.use("/api/trends", trendsRouter);
app.use("/api/templates", templateRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
