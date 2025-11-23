import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    await db.getConnection();
    console.log("📌 MySQL Connected");
  } catch (err) {
    console.error("❌ MySQL Error:", err.message);
    process.exit(1);
  }
};
