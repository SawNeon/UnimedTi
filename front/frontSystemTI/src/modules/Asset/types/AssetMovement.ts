export interface AssetMovementDTO {
  id?: string;
  reason: string;
  responsible: string;
  sector: { id: string };
  expectedReturnDate?: string;
  type: 'IN' | 'OUT';
}