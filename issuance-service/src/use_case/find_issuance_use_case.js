import { IssuanceNotFoundError } from "./models.js";
class FindIssuanceUseCase {
    dbRepo;
    constructor(dbRepo) {
        this.dbRepo = dbRepo;
    }
    async execute(id) {
        const issuance = await this.dbRepo.findById(id);
        if (!issuance) {
            throw new IssuanceNotFoundError("Issuance not found");
        }
        return {
            ...issuance,
            workerId: process.env.HOSTNAME || "local",
        };
    }
}
export default FindIssuanceUseCase;
//# sourceMappingURL=find_issuance_use_case.js.map