import express from "express";
import dotenv from 'dotenv';
import cors from 'cors'
import connectDB from "./db"
import userRoute from "./Router/userRouter"

// Load environment variables from .env file
dotenv.config();

const app = express();
const port =  process.env.PORT || 3003;
connectDB();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Aegis Backend API');
});

app.use("/api/user", userRoute);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
