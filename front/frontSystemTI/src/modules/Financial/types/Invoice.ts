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

  export interface ApportionmentItem {
      sectorId: string;
      sectorName: string;
      allocation: number;
}
  
  export interface InvoiceModalProps {
      isOpen: boolean;
      onClose: () => void;
      contract: ContractMonthResponse | null;
      mode: 'create' | 'view';
      onSuccess?: () => void;
}