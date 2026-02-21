import type { IIssuanceRepository } from "../respository/abstract_db_repo.js";
import type { IssuanceCreated } from "./models.js";
import { IssuanceNotFoundError } from "./models.js";


class FindIssuanceUseCase {
  constructor(private readonly dbRepo: IIssuanceRepository) {}

  async execute(id: string): Promise<IssuanceCreated | IssuanceNotFoundError> {
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