class CreateIssuanceUseCase {
    dbRepo;
    constructor(dbRepo) {
        this.dbRepo = dbRepo;
    }
    async execute(issuance) {
        const created_result = await this.dbRepo.create(issuance);
        const worker_id = process.env.HOSTNAME || "local";
        return {
            ...created_result,
            workerId: worker_id,
        };
    }
}
export default CreateIssuanceUseCase;
//# sourceMappingURL=create_issuance_use_case.js.map