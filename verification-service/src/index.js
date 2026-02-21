import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Verification Service is running!");
});
app.use("/api", routes);
app
    .listen(PORT, () => {
    console.log(`Verification Service is listening on port ${PORT}`);
})
    .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the other process or use a different PORT.`);
    }
    else {
        console.error("Server error:", err);
    }
    process.exit(1);
});
//# sourceMappingURL=index.js.map