import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routers as named exports (because your files do NOT export default)
import * as authRoutes from "./routes/auth.js";
import * as billingRoutes from "./routes/billing.js";
import * as challengesRoutes from "./routes/challenges.js";
import * as instancesRoutes from "./routes/instances.js";
import * as leaderboardRoutes from "./routes/leaderboard.js";
import * as lessonsRoutes from "./routes/lessons.js";

const app = express();

// ------------------------------------------------------
// CORS — FIXED FOR 5174 + NGROK
// ------------------------------------------------------

console.log({
    authRouter: authRoutes.authRouter,
    billingRouter: billingRoutes.billingRouter,
    challengesRouter: challengesRoutes.challengesRouter,
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://unpetticoated-unwarlike-marty.ngrok-free.dev"
    ],
    credentials: true,
  })
);

// ------------------------------------------------------
// CORE MIDDLEWARE
// ------------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// ------------------------------------------------------
// ROUTES — using .router because named imports
// ------------------------------------------------------
app.use("/api/auth", authRoutes.authRouter);
app.use("/api/billing", billingRoutes.billingRouter);
app.use("/api/challenges", challengesRoutes.challengesRouter);
app.use("/api/instances", instancesRoutes.instancesRouter);
app.use("/api/leaderboard", leaderboardRoutes.leaderboardRouter);
app.use("/api/lessons", lessonsRoutes.lessonsRouter);

// ------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ------------------------------------------------------
// EXPORT APP
// ------------------------------------------------------
export default app;
