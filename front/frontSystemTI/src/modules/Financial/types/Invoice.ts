import type { ContractMonthResponse } from "../types/Contract";

export type InvoiceStatus = 'ISSUED' | 'DELIVERED' | 'CANCELLED';

export interface InvoiceDTO {
    id?: string;
    contractId: string;
    number: number;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: InvoiceStatus;


    referenceMonth?: string;
    costCenters?: string;
}

export interface InvoiceCreateDTO {
    contractId: string;
    number: number;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    items: {
        sectorId: string;
        allocation: number;
    }[];
}

export interface ApportionmentItem {
    sectorId: string;
    sectorName: string;
    allocation: number;
    percentage: number;
    isManual: boolean;
}

export interface InvoiceApportionmentTemplateDTO {
    sourceInvoiceId: string;
    sourceInvoiceNumber: number;
    sourceIssueDate: string;
    sourceTotalAmount: number;
    items: {
        sectorId: string;
        sectorName: string;
        allocation: number;
        percentage: number;
    }[];
}

export interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: ContractMonthResponse | null;
    mode: 'create' | 'view';
    referenceMonth?: string;
    onSuccess?: () => void;
}

export interface InvoiceCostCenterViewDTO {
    id: string;
    contractId: string;
    number: number;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    status: string;
    serviceDescription: string;
    serviceType: string;
    items: {
        sectorId: string;
        sectorName: string;
        costCenterCode: string;
        allocation: number;
        percentage: number;
    }[];
}
