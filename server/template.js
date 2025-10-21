import express from "express";
import { query } from "./db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    const templates = await query(
      "SELECT * FROM workout_template WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

router.get("/:template_id", async (req, res) => {
  const { template_id } = req.params;

  try {
    const exercises = await query(
      `SELECT wt_ex.id as workout_exercise_id, e.id as exercise_id, e.name, e.muscle, e.equipment,
             es.set_no, es.reps, es.weight
       FROM workout_exercises_template wt_ex
       JOIN exercises e ON wt_ex.exercise_id = e.id
       LEFT JOIN exercise_sets_template es ON wt_ex.id = es.workout_exercise_template_id
       WHERE wt_ex.workout_template_id = ? 
       ORDER BY wt_ex.id, es.set_no`,
      [template_id]
    );
    const result = [];
    exercises.forEach((row) => {
      let ex = result.find(
        (e) => e.workout_exercise_id === row.workout_exercise_id
      );
      if (!ex) {
        ex = {
          workout_exercise_id: row.workout_exercise_id,
          exercise_id: row.exercise_id,
          name: row.name,
          muscle: row.muscle,
          equipment: row.equipment,
          sets: [],
        };
        result.push(ex);
      }
      if (row.set_no != null) {
        ex.sets.push({
          set_no: row.set_no,
          reps: row.reps,
          weight: row.weight,
        });
      }
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch template details" });
  }
});

router.post("/", async (req, res) => {
  const { user_id, title, exercises } = req.body; 
  if (!user_id || !title || !Array.isArray(exercises))
    return res.status(400).json({ error: "Missing data" });

  try {
    const templateResult = await query(
      "INSERT INTO workout_template (user_id, title) VALUES (?, ?)",
      [user_id, title]
    );
    const template_id = templateResult.insertId;

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exResult = await query(
        "INSERT INTO workout_exercises_template (workout_template_id, exercise_id, exercise_name, order_no) VALUES (?, ?, ?, ?)",
        [template_id, ex.exercise_id, ex.name || "Unnamed Exercise", i + 1]
      );

      const workout_exercise_template_id = exResult.insertId;
      for (let set of ex.sets || []) {
        await query(
          "INSERT INTO exercise_sets_template (workout_exercise_template_id, set_no, reps, weight) VALUES (?, ?, ?, ?)",
          [
            workout_exercise_template_id,
            set.set_no || 1,
            set.reps || 0,
            set.weight || 0,
          ]
        );
      }
    }

    res.json({ success: true, template_id });
  } catch (err) {
    console.error("DB query error:", err);
    res.status(500).json({ error: "Failed to create template" });
  }
});

router.delete("/:template_id", async (req, res) => {
  const { template_id } = req.params;

  try {
    await query(
      "DELETE FROM exercise_sets_template WHERE workout_exercise_template_id IN (SELECT id FROM workout_exercises_template WHERE workout_template_id = ?)",
      [template_id]
    );

    await query(
      "DELETE FROM workout_exercises_template WHERE workout_template_id = ?",
      [template_id]
    );
    await query("DELETE FROM workout_template WHERE id = ?", [template_id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

export default router;
