import type { Issuance } from "../use_case/models.js";
export interface IIssuanceRepository {
    create(issuance: Issuance): Promise<Issuance>;
    findAll(): Promise<Issuance[]>;
    findById(id: string): Promise<Issuance | null>;
    findByName(name: string): Promise<Issuance | null>;
}
//# sourceMappingURL=abstract_db_repo.d.ts.map