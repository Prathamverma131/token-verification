import type { IIssuanceRepository } from "../respository/abstract_db_repo.js";
import type { Issuance ,IssuanceCreated} from "./models.js";

class CreateIssuanceUseCase {
  constructor(private readonly dbRepo: IIssuanceRepository) {}

  async execute(issuance: Issuance): Promise<IssuanceCreated> {
    const created_result = await this.dbRepo.create(issuance);
    const worker_id =  process.env.HOSTNAME || "local"
    return {
      ...created_result,
      workerId: worker_id,
    };
  }
}

export default CreateIssuanceUseCase;
