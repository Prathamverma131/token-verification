import type { Issuance } from "../use_case/models.js";
import type { IIssuanceRepository } from "./abstract_db_repo.js";
export declare class JsonFileRepo implements IIssuanceRepository {
    private readonly filePath;
    constructor(dataDir?: string, filename?: string);
    private ensureFile;
    private writeAll;
    create(issuance: Issuance): Promise<Issuance>;
    findAll(): Promise<Issuance[]>;
    findById(id: string): Promise<Issuance | null>;
    findByName(name: string): Promise<Issuance | null>;
}
export default JsonFileRepo;
//# sourceMappingURL=json_file_repo.d.ts.map