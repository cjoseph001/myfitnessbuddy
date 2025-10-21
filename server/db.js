import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Kuda2815",
  database: process.env.DB_NAME || "myfitnessbuddy",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("DB query error:", err.message);
    throw err;
  }
};

export default pool;
