/** Espelha AccessLevel do backend. A ordem importa: OPERATE cobre READ. */
export type AccessLevel = 'NONE' | 'READ' | 'OPERATE';

export type ModuleKey =
  | 'STOCK'
  | 'ASSET'
  | 'ORDER'
  | 'FINANCIAL'
  | 'PRINTER'
  | 'USER_MANAGEMENT';

export interface UnitAccess {
  unitId: string;
  unitName: string;
  level: AccessLevel;
}

export interface ModuleAccess {
  module: ModuleKey;
  /** Maior nivel entre as unidades. */
  level: AccessLevel;
  units: UnitAccess[];
}

export interface MeDTO {
  id: string;
  login: string;
  name: string;
  email: string;
  profileName: string | null;
  modules: ModuleAccess[];
}

export interface AccessProfileDTO {
  id: string;
  name: string;
  description: string | null;
}

export interface UserDTO {
  id: string;
  login: string;
  name: string;
  email: string;
  active: boolean;
  profileId: string | null;
  profileName: string | null;
  createdAt: string | null;
}

/**
 * Helpers de leitura do /me.
 *
 * Servem so para montar a navegacao. Quem recusa a operacao e o @PreAuthorize no
 * backend -- adulterar isto no navegador nao concede acesso a nada.
 */
export function moduleAccess(me: MeDTO | null, module: ModuleKey): ModuleAccess | undefined {
  return me?.modules.find(m => m.module === module);
}

export function canSee(me: MeDTO | null, module: ModuleKey): boolean {
  return (moduleAccess(me, module)?.level ?? 'NONE') !== 'NONE';
}

export function canOperate(me: MeDTO | null, module: ModuleKey): boolean {
  return moduleAccess(me, module)?.level === 'OPERATE';
}

/**
 * Operacao valida em TODAS as unidades — espelha canOperateAllUnits do backend.
 *
 * Exigido pelo que afeta os dois estoques de uma vez, como excluir um produto do
 * catalogo. Serve para nao oferecer um botao que o backend recusaria.
 */
export function canOperateAllUnits(me: MeDTO | null, module: ModuleKey): boolean {
  const access = moduleAccess(me, module);
  if (!access || access.units.length === 0) return false;
  return access.units.every(u => u.level === 'OPERATE');
}

/** Unidades em que a pessoa alcanca o modulo — alimenta o seletor de estoque. */
export function accessibleUnits(me: MeDTO | null, module: ModuleKey): UnitAccess[] {
  return moduleAccess(me, module)?.units.filter(u => u.level !== 'NONE') ?? [];
}
