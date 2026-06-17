import { api } from "../../../shared/services/api";
import type { InvoiceCostCenterViewDTO } from "../types/Invoice";

export const InvoiceService = {
    async getById(id: string): Promise<InvoiceCostCenterViewDTO> {
        const response = await api.get<InvoiceCostCenterViewDTO>(`/invoices/${id}`);
        return response.data;
    }
};