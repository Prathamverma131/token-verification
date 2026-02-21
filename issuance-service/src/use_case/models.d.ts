export interface Issuance {
    id: string;
    name: string;
    createdAt: string;
}
export interface IssuanceCreated {
    id: string;
    createdAt: string;
    workerId: string;
}
export declare class IssuanceNotFoundError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=models.d.ts.map