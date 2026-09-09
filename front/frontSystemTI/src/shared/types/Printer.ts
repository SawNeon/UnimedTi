export interface PrinterShareDTO {
  sectorId: string;
  sectorName?: string;
  costCenterCode?: number;
  percentage: number;
}

export interface PrinterDTO {
  id: string;
  serialNumber: string;
  assetTag: string | null;
  model: string | null;
  ipAddress: string | null;
  enterpriseId: string | null;
  enterpriseName: string | null;
  /** Falso para a impressora que o PrintWay não lê e alguém digita todo mês. */
  autoRead: boolean;
  backup: boolean;
  active: boolean;
  shares: PrinterShareDTO[];
}

export interface PrinterPayload {
  serialNumber: string;
  assetTag?: string | null;
  model?: string | null;
  ipAddress?: string | null;
  enterpriseId: string;
  autoRead: boolean;
  backup: boolean;
  active: boolean;
  shares: { sectorId: string; percentage: number }[];
}

export type ReadingSource = 'PRINTWAY' | 'MANUAL';

export interface ReadingDTO {
  id: string;
  printerId: string;
  serialNumber: string;
  model: string | null;
  assetTag: string | null;
  /** Empresa da impressora: o rateio só pode usar setores dela. */
  enterpriseId: string | null;
  enterpriseName: string | null;
  competence: string;
  blackStart: number;
  blackEnd: number;
  colorStart: number;
  colorEnd: number;
  a3Black: number;
  a3Color: number;
  blackConsumption: number;
  colorConsumption: number;
  source: ReadingSource;
  corrected: boolean;
  /** Contador andou para trás: precisa de conferência. */
  inconsistent: boolean;
  withoutShares: boolean;
  /** Ninguém informou a contagem deste mês. */
  pending: boolean;
  notes: string | null;
  shares: PrinterShareDTO[];
}

export interface ReadingPayload {
  blackStart: number;
  blackEnd: number;
  colorStart: number;
  colorEnd: number;
  a3Black?: number;
  a3Color?: number;
  notes?: string | null;
  shares?: { sectorId: string; percentage: number }[] | null;
}

export interface ImportResultDTO {
  linhasLidas: number;
  atualizadas: number;
  seriesDesconhecidas: string[];
  semLeituraNoArquivo: string[];
  inconsistentes: string[];
}

export interface ClosingDTO {
  competence: string;
  blackPageCost: number;
  colorPageCost: number;
  enterprises: {
    enterpriseId: string;
    enterpriseName: string;
    blackPages: number;
    colorPages: number;
    blackCost: number;
    colorCost: number;
    franchiseApplied: boolean;
    fixedCharge: number;
    total: number;
    includedInTotal: boolean;
  }[];
  sectors: {
    sectorId: string;
    sectorName: string;
    costCenterCode: number;
    blackPages: number;
    colorPages: number;
    cost: number;
  }[];
  total: number;
  pendencies: {
    naoInformadas: string[];
    contadorInvertido: string[];
    semRateio: string[];
    paginasSemRateio: number;
  };
}

/** Preço da página, válido a partir de um mês. */
export interface PriceDTO {
  id: string;
  validFrom: string;
  blackPageCost: number;
  colorPageCost: number;
}

export interface PricePayload {
  validFrom: string;
  blackPageCost: number;
  colorPageCost: number;
}

/** Condições do contrato de impressão de uma empresa, a partir de um mês. */
export interface TermsDTO {
  id: string;
  validFrom: string;
  enterpriseId: string;
  enterpriseName: string;
  colorFranchiseLimit: number;
  colorFranchiseValue: number;
  fixedCharge: number;
  includedInTotal: boolean;
}

export interface TermsPayload {
  validFrom: string;
  enterpriseId: string;
  colorFranchiseLimit: number;
  colorFranchiseValue: number;
  fixedCharge: number;
  includedInTotal: boolean;
}
