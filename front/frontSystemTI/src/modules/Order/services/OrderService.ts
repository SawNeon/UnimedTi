import { api } from '../../../shared/services/api';
import type { OrderDTO } from '../types/Order';

export const OrderService = {
    create: async (orderData: Partial<OrderDTO>, requestFile: File | null) => {
        const formData = new FormData();

        const jsonBlob = new Blob([JSON.stringify(orderData)], { type: 'application/json' });
        formData.append('data', jsonBlob);

        if(requestFile){
            formData.append('requestFile', requestFile);
        }

        const response = await api.post('/orders', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'}
        });
        return response.data;
    },
    
    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/orders/${id}`);
        return true;
    },

    viwerFile: async (path: string) => {
        const response = await api.get(`/files/view?path=${path}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    deliver: async (id: string, invoiceFile: File | null) => {
        const formData = new FormData();
        
        if (invoiceFile) {
            formData.append('invoiceFile', invoiceFile);
        }

        const response = await api.patch(`/orders/${id}/deliver`, formData);

        return response.data;
    },
}