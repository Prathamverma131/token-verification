import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 5000;

const BINDS: string = process.env.BINDS || "0.0.0.0";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Verification Service is running!");
});

app.get("/health",(req,res)=>{
  res.send("App running successfully!")
})

app.use("/api", routes);

app
  .listen(PORT, BINDS, () => {
    console.log(`Verification Service is listening on port ${PORT}`);
  })
  .on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or use a different PORT.`,
      );
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });
