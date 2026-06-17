import { api } from "../../../shared/services/api";
import type { InvoiceApportionmentTemplateDTO, InvoiceCostCenterViewDTO } from "../types/Invoice";

export const InvoiceService = {
    async getById(id: string): Promise<InvoiceCostCenterViewDTO> {
        const response = await api.get<InvoiceCostCenterViewDTO>(`/invoices/${id}`);
        return response.data;
    },

    async getPreviousApportionmentTemplate(
        contractId: string,
        referenceDate: string
    ): Promise<InvoiceApportionmentTemplateDTO | null> {
        const response = await api.get<InvoiceApportionmentTemplateDTO | "">(
            `/invoices/contracts/${contractId}/apportionment-template`,
            {
                params: { referenceDate }
            }
        );

        return response.status === 204 || !response.data ? null : response.data;
    }
};
