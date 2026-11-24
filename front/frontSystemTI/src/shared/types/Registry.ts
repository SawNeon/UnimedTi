/** Empresa (CNPJ) do grupo. */
export interface EnterpriseDTO {
  id: string;
  name: string;
  locale: string;
  /** Quantos setores dependem dela — sinaliza o que a exclusão vai barrar. */
  sectorCount: number;
}

export interface EnterprisePayload {
  name: string;
  locale: string;
}

/** Setor, que é o centro de custo usado no rateio. */
export interface SectorDTO {
  id: string;
  name: string;
  groupName: string;
  costCenterCode: string;
  pyramidCode: string | null;
  enterpriseId: string | null;
  enterpriseName: string | null;
}

export interface SectorPayload {
  name: string;
  enterpriseId: string;
  groupName: string;
  costCenterCode: string;
  pyramidCode: string | null;
}

/** Empresa fornecedora: quem emite a nota do contrato. */
export interface SupplierDTO {
  id: string;
  name: string;
  document: string | null;
  notes: string | null;
  active: boolean;
}

export interface SupplierPayload {
  name: string;
  document: string | null;
  notes: string | null;
  active: boolean;
}
