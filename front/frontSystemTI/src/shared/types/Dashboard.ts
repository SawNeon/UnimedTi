export interface DashboardKpis {
  total: number;
  previousTotal: number | null;
  difference: number | null;
  differencePercent: number | null;
  /** Contratos ativos sem nota lançada no mês. */
  pendingInvoices: number;
  contractsWithInvoice: number;
  blackPages: number;
  colorPages: number;
}

export interface MonthPoint {
  competence: string;
  contracts: number;
  printers: number;
  total: number;
}

export interface NamedValue {
  id: string | null;
  name: string;
  code: number | null;
  value: number;
}

export interface MonthPages {
  competence: string;
  blackPages: number;
  colorPages: number;
}

export interface DashboardDTO {
  competence: string;
  kpis: DashboardKpis;
  series: MonthPoint[];
  byEnterprise: NamedValue[];
  bySector: NamedValue[];
  pages: MonthPages[];
}
