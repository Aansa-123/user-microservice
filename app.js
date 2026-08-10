import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import client from "prom-client";

dotenv.config();

const app = express();

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ 
    register 
});

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3001",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);
//middleware
app.use(cookieParser());
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds =
      duration[0] + duration[1] / 1e9;

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      },
      durationInSeconds
    );
  });

  next();
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
//port configuration

const port = process.env.PORT || 3000;

app.use("/users", userRouter);

//api routes

app.get("/", (req, res) => {
  res.send("User API is running");
});

//server start

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
