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


/** Resultado da comparação com o mês anterior, calculada pelo backend. */
export type InvoiceComparison =
    | 'PENDENTE'
    | 'PRIMEIRA'
    | 'MANTEVE'
    | 'AUMENTOU'
    | 'DIMINUIU';

export type CostAllocationType = 'APPORTIONED' | 'ENTERPRISE';

export interface ContractMonthResponse {
    id: string;
    enterpriseName: string;
    type: string;
    serviceDescription: string;
    status: ContractStatus | string;
    currentInvoice: {
        id: string;
        /** Texto: no histórico há notas como "2023/1141". */
        number: string;
        value: number;
        issueDate: string;
        dueDate: string;
        status: string;
        costAllocation: CostAllocationType;
        deliveryTarget: string;
        /** Prazo do TI para entregar, vindo do calendário do Financeiro. */
        deliveryDeadline: string;
        deliveredAt: string | null;
    } | null;
    /** Valor da nota do mês anterior. Nulo quando não houve. */
    previousAmount: number | null;
    comparison: InvoiceComparison;
    difference: number | null;
    differencePercent: number | null;
}
