export interface ProductDTO {
  id?: string;
  name: string;
  description: string;
  currentStock: number;
  minStockLevel: number;
}

export interface MovementPayload {
  id: string;
  quantity: number;
  reason: string;
  responsible: string;
  sector: string;
}