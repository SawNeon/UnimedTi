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
  costCenterCode: number;
  enterpriseId: string | null;
  enterpriseName: string | null;
}

export interface SectorPayload {
  name: string;
  enterpriseId: string;
  groupName: string;
  costCenterCode: number;
}
