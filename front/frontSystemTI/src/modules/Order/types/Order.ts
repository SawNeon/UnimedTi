export interface OrderDTO {
    id?: string;
    sector: { id: string };
    type: string;
    description: string;
    status: string;
    numberRequest: string;
    requestDate: string;
    orderDate: string;
    expectedDeliveryDate: string;
    request?: string;
    invoice?: string;
}