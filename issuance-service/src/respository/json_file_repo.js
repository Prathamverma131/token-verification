import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = join(__dirname, "..", "..", "data");
const DEFAULT_FILE = "issuances.json";
export class JsonFileRepo {
    filePath;
    constructor(dataDir = DEFAULT_DATA_DIR, filename = DEFAULT_FILE) {
        this.filePath = join(dataDir, filename);
    }
    async ensureFile() {
        try {
            const raw = await readFile(this.filePath, "utf-8");
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [];
        }
        catch (err) {
            const code = err && typeof err === "object" && "code" in err ? err.code : "";
            if (code === "ENOENT") {
                await mkdir(dirname(this.filePath), { recursive: true });
                return [];
            }
            throw err;
        }
    }
    async writeAll(issuances) {
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(this.filePath, JSON.stringify(issuances, null, 2), "utf-8");
    }
    async create(issuance) {
        const issuances = await this.ensureFile();
        issuances.push(issuance);
        await this.writeAll(issuances);
        return issuance;
    }
    async findAll() {
        return this.ensureFile();
    }
    async findById(id) {
        const issuances = await this.ensureFile();
        return issuances.find((issuance) => issuance.id === id) || null;
    }
    async findByName(name) {
        const issuances = await this.ensureFile();
        return issuances.find((issuance) => issuance.name === name) || null;
    }
}
export default JsonFileRepo;
//# sourceMappingURL=json_file_repo.js.map