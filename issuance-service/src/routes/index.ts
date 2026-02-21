import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { JsonFileRepo } from "../respository/json_file_repo.js";
import CreateIssuanceUseCase from "../use_case/create_issuance_use_case.js";
import type { Issuance } from "../use_case/models.js";
import FindIssuanceUseCase from "../use_case/find_issuance_use_case.js";
import { IssuanceNotFoundError } from "../use_case/models.js";

const repo = new JsonFileRepo();
const createIssuanceUseCase = new CreateIssuanceUseCase(repo);
const findIssuanceUseCase = new FindIssuanceUseCase(repo);

const router = express.Router();

router.get("/issuances", async (req: Request, res: Response) => {
  const issuances = await repo.findAll();
  res.json(issuances);
});

router.get("/issuances/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const issuance = await findIssuanceUseCase.execute(id);
    return res.status(200).json(issuance);
  } catch (error) {
    return res.status(404).json({ error: (error as IssuanceNotFoundError).message });
  }
});

router.post("/issuances", async (req: Request, res: Response) => {
  const body = req.body as { name?: string };
  const name = body.name;

  if (name) {
    const existing = await repo.findByName(name);
    if (existing) {
      return res.status(200).json({ ...existing, alreadyPresent: true, info:"Credentials already exists" ,worker_id: process.env.HOSTNAME || "local"});
    }
  }
  else {
    return res.status(400).json({ error: "Name is required" });
  }

  const issuance: Issuance = {
    id: randomUUID(),
    name: name ?? "",
    createdAt: new Date().toISOString(),
  };
  const created = await createIssuanceUseCase.execute(issuance);
  res.status(201).json(created);
});

export default router;