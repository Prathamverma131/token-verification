import type { IIssuanceRepository } from "../respository/abstract_db_repo.js";
import type { IssuanceCreated } from "./models.js";
import { IssuanceNotFoundError } from "./models.js";
declare class FindIssuanceUseCase {
    private readonly dbRepo;
    constructor(dbRepo: IIssuanceRepository);
    execute(id: string): Promise<IssuanceCreated | IssuanceNotFoundError>;
}
export default FindIssuanceUseCase;
//# sourceMappingURL=find_issuance_use_case.d.ts.map