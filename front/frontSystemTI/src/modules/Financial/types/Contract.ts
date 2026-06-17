import type { EnterpriseDTO } from "../../../shared/types/Enterprise";

export type ContractStatus = 'ACTIVE' | 'INACTIVE';

export interface ContractDTO {
    id?: string;
    enterprise?: EnterpriseDTO;
    serviceType: string;
    serviceDescription: string;
    startDate: string;
    endDate?: string;
    status: ContractStatus;
}


export interface ContractMonthResponse {
    id: string;
    enterpriseName: string; 
    type: string;           
    serviceDescription: string;
    status: ContractStatus | string;
    currentInvoice: {
        id: string;
        number: number;
        value: number; 
        status: string; 
    } | null; 
}
