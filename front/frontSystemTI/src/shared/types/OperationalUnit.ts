/**
 * Unidade operacional: o "lado" responsável pelo dado.
 *
 * São duas — Operadora (matriz, Getúlio Vargas e seccionais) e Hospital
 * (hospital, APS e serviços próprios). Vêm do backend, não são fixas aqui.
 */
export interface OperationalUnitDTO {
  id: string;
  name: string;
  slug: string;
}
