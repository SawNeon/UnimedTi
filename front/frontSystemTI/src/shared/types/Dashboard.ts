/**
 * Os dois painéis do sistema, um por planilha de origem.
 *
 * São separados de propósito: o de contratos responde "quanto o TI gastou" e o
 * de impressoras responde "quanto cada setor imprimiu e quanto isso é repassado".
 * Misturar os dois somaria o mesmo dinheiro duas vezes, já que a fatura da
 * Printec entra como nota de contrato.
 */

export interface NamedValue {
  id: string | null;
  name: string;
  value: number;
}

export interface MonthValue {
  competence: string;
  value: number;
}

export interface ContractsDashboardDTO {
  competence: string;
  kpis: {
    total: number;
    previousTotal: number | null;
    difference: number | null;
    differencePercent: number | null;
    pendingInvoices: number;
    contractsWithInvoice: number;
    /** Custo do TI no ano da competência. */
    yearTotal: number;
    year: number;
  };
  series: MonthValue[];
  byEnterprise: NamedValue[];
  /** Gasto do ano por categoria de serviço — a coluna TIPO da planilha. */
  byServiceType: NamedValue[];
}

export interface PrintersDashboardDTO {
  competence: string;
  kpis: {
    blackPages: number;
    colorPages: number;
    previousBlackPages: number | null;
    previousColorPages: number | null;
    monthCost: number;
    previousCost: number | null;
    difference: number | null;
    differencePercent: number | null;
    yearBlackPages: number;
    yearColorPages: number;
    yearCost: number;
    year: number;
    pendingReadings: number;
  };
  pages: { competence: string; blackPages: number; colorPages: number }[];
  cost: MonthValue[];
  /** Uma série por empresa, preto e cor separados — é o gráfico da planilha. */
  byEnterprise: {
    enterpriseId: string;
    enterpriseName: string;
    blackPages: number[];
    colorPages: number[];
  }[];
  costCenters: {
    enterpriseId: string;
    enterpriseName: string;
    total: number;
    costCenters: {
      sectorId: string;
      sectorName: string;
      costCenterCode: string;
      pyramidCode: string | null;
      blackPages: number;
      colorPages: number;
      cost: number;
    }[];
  }[];
}
