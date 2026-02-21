import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

const BINDS: string = process.env.BINDS || "0.0.0.0";

app.use(
  cors({
    origin: true, // reflect request origin (e.g. http://localhost:3001)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Issuance Service is running!');
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

app.listen(PORT, BINDS, () => {
  console.log(`Issuance Service is listening on port ${PORT}`);
}).on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or use a different PORT.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});