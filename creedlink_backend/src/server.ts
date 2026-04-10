import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import agreementRoutes from "./routes/agreement.route.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import workRoutes from "./routes/work.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import followRoutes from "./routes/follow.routes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/users", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/works", workRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});
