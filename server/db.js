import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "Kuda2815",
  database: process.env.MYSQL_DATABASE || "myfitnessbuddy",
  port: Number(process.env.MYSQLPORT) || 3306,
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
