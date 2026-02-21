import type { IIssuanceRepository } from "../respository/abstract_db_repo.js";
import type { Issuance, IssuanceCreated } from "./models.js";
declare class CreateIssuanceUseCase {
    private readonly dbRepo;
    constructor(dbRepo: IIssuanceRepository);
    execute(issuance: Issuance): Promise<IssuanceCreated>;
}
export default CreateIssuanceUseCase;
//# sourceMappingURL=create_issuance_use_case.d.ts.map