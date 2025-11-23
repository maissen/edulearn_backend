import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./config/db.js"; // attention à 'bd.js'


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
