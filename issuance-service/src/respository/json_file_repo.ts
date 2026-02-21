import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Issuance } from "../use_case/models.js";
import type { IIssuanceRepository } from "./abstract_db_repo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_DATA_DIR = join(__dirname, "..", "..", "data");
const DEFAULT_FILE = "issuances.json";

export class JsonFileRepo implements IIssuanceRepository {
  private readonly filePath: string;

  constructor(dataDir: string = DEFAULT_DATA_DIR, filename: string = DEFAULT_FILE) {
    this.filePath = join(dataDir, filename);
  }

  private async ensureFile(): Promise<Issuance[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const data = JSON.parse(raw) as Issuance[];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : "";
      if (code === "ENOENT") {
        await mkdir(dirname(this.filePath), { recursive: true });
        return [];
      }
      throw err;
    }
  }

  private async writeAll(issuances: Issuance[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(issuances, null, 2), "utf-8");
  }

  async create(issuance: Issuance): Promise<Issuance> {
    const issuances = await this.ensureFile();
    issuances.push(issuance);
    await this.writeAll(issuances);
    return issuance;
  }

  async findAll(): Promise<Issuance[]> {
    return this.ensureFile();
  }

  async findById(id: string): Promise<Issuance | null> {
    const issuances = await this.ensureFile();
    return issuances.find((issuance) => issuance.id === id) || null;
  }

  async findByName(name: string): Promise<Issuance | null> {
    const issuances = await this.ensureFile();
    return issuances.find((issuance) => issuance.name === name) || null;
  }
}

export default JsonFileRepo;
