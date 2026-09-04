import { api } from '../../../shared/services/api';
import type {
    MovementPayload,
    ProductDTO,
    ProductFormPayload,
    TransferPayload
} from '../types/Product';

/**
 * Toda operação de saldo carrega o `unitId`: não existe "o estoque", existem dois.
 * O backend recusa a chamada sem ele, de propósito — um padrão implícito faria a
 * equipe do hospital mexer no estoque da matriz por engano.
 */
export const ProductService = {
    create: async (product: ProductFormPayload, unitId: string) => {
        const response = await api.post('/products', product, { params: { unitId } });
        return response.data;
    },

    getAll: async (page: number, size: number, unitId: string) => {
        const response = await api.get('/products', { params: { page, size, unitId } });
        return response.data;
    },

    update: async (id: string, product: ProductFormPayload, unitId: string) => {
        const response = await api.put(`/products/${id}`, product, { params: { unitId } });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    },

    addStock: async (movement: MovementPayload, unitId: string) => {
        const { id, ...payload } = movement;
        const response = await api.post(`/products/${id}/add-stock`, payload, { params: { unitId } });
        return response.data as ProductDTO;
    },

    removeStock: async (movement: MovementPayload, unitId: string) => {
        const { id, ...payload } = movement;
        const response = await api.post(`/products/${id}/remove-stock`, payload, { params: { unitId } });
        return response.data as ProductDTO;
    },

    /** Move quantidade de um estoque para o outro; o total somado não muda. */
    transfer: async (transfer: TransferPayload) => {
        const { id, ...payload } = transfer;
        const response = await api.post(`/products/${id}/transfer`, payload);
        return response.data as ProductDTO;
    }
};
