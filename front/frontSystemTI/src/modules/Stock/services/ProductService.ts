import { api } from '../../../shared/services/api';
import type { ProductDTO, MovementPayload } from '../types/Product';

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
    },
    
    // now accept the full movement object that already contains the product id
    addStock: async (movement: MovementPayload) => {
    const { id, ...payload } = movement;
    const response = await api.post(`/products/${id}/add-stock`, payload);
    return response.data;
   },
   removeStock: async (movement: MovementPayload) => {
    // same logic for removal, deconstructing id from the payload
    const { id, ...payload } = movement;
    const response = await api.post(`/products/${id}/remove-stock`, payload);
    return response.data;
  }
};

