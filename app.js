import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3001",
            "http://localhost:5174"
        ],
        credentials: true
    })
);

app.use(cookieParser());

const port = process.env.PORT || 3000;

app.use("/users", userRouter);

app.get("/", (req, res) => {
    res.send("User API is running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});