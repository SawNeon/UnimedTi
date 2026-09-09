const UNIT_KEY = 'operationalUnitId';

/**
 * Guarda qual estoque o operador está vendo, para a escolha sobreviver ao reload.
 *
 * É só conveniência de tela: quem realmente decide o que a pessoa pode acessar é
 * o backend. Um valor adulterado aqui não dá acesso a nada.
 */
export function getSelectedUnitId(): string | null {
  try {
    return localStorage.getItem(UNIT_KEY);
  } catch {
    return null;
  }
}

export function setSelectedUnitId(unitId: string) {
  try {
    localStorage.setItem(UNIT_KEY, unitId);
  } catch {
    /* modo privado ou storage bloqueado: a seleção vale só para esta sessão */
  }
}

export function clearSelectedUnitId() {
  try {
    localStorage.removeItem(UNIT_KEY);
  } catch {
    /* idem */
  }
}
