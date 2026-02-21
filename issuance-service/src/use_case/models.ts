export interface Issuance {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}

export interface IssuanceCreated {
  id: string;
  createdAt: string; // ISO date string
  workerId: string;
}

export class IssuanceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IssuanceNotFoundError";
  }
}