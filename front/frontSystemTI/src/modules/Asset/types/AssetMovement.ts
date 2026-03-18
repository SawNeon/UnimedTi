export interface AssetMovementDTO {
  id?: string;
  reason: string;
  responsible: string;
  sector: string;
  expectedReturnDate?: string;
  type: 'IN' | 'OUT';
}