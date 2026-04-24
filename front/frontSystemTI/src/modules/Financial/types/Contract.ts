export interface ContractDTO {
    id?: string;
    name: string;
    enterprise: { id: string };
    serviceType: string;
    seriveDescription: string;
    startDate: string;
    endDate: string;
    status: string;
}   