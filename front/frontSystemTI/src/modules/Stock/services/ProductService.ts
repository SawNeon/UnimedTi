import { api } from '../../../shared/services/api';
import type { ProductDTO } from '../types/Product';

export const ProductService = {
    create: async (product: ProductDTO) => {
        const reponse = await api.post('/products', product);
        return reponse.data;
    },

    getAll: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    update: async (id: string, product: ProductDTO) => {
        const response = await api.put(`/products/${id}`, product);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    }
};