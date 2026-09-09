/**
 * Produto já resolvido para uma unidade: `currentStock` e `minStockLevel` são
 * daquele estoque, não um total somado dos dois.
 */
export interface ProductDTO {
  id?: string;
  name: string;
  description: string;
  currentStock: number;
  minStockLevel: number;
  unitId?: string;
  unitName?: string;
  belowMinimum?: boolean;
}

/** O que o formulário envia. O saldo não entra aqui — ele vem de movimentação. */
export interface ProductFormPayload {
  name: string;
  description: string;
  minStockLevel: number;
}

export interface MovementPayload {
  id: string;
  quantity: number;
  reason: string;
  responsible: string;
  sectorId?: string;
}

export interface TransferPayload {
  id: string;
  fromUnitId: string;
  toUnitId: string;
  quantity: number;
  reason: string;
  responsible: string;
}
