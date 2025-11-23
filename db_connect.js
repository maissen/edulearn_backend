import mysql2 from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

const test = async () => {
  try {
    const [rows] = await db.query("SHOW TABLES");
    console.log("✅ Connexion OK, tables :", rows);
  } catch (err) {
    console.error("❌ Erreur MySQL :", err.message);
  }
};

test();
