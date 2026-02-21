import express, { type Request, type Response } from "express";
import axios from "axios";

const router = express.Router();

const issuance_service_url = process.env.ISSUANCE_SERVICE_URL || "http://localhost:3000";
const worker_id = process.env.WORKER_ID || "localhost";

router.get("/verification/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try{
    const issuance_record = await axios.get(`${issuance_service_url}/api/issuances/${id}`);
    console.log(worker_id);
    return res.status(200).json({ worker_id, issuance_record: issuance_record.data });
  } catch (error) {
    return res.status(404).json({ error: "Issuance record not found", worker_id: worker_id });
  }
});

export default router;