import type { ReactNode } from 'react';
import styles from '../../Users/pages/UserList.module.css';

export const money = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const inteiro = (v: number) => Number(v).toLocaleString('pt-BR');

export const mesLongo = (iso: string) => {
  const [ano, mes] = iso.split('-');
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${nomes[Number(mes) - 1]} de ${ano}`;
};

/** Título, nota explicativa e o gráfico embaixo. */
export function Bloco({ titulo, nota, children }: {
  titulo: string;
  nota?: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 15, marginBottom: nota ? 2 : 12 }}>{titulo}</h3>
      {nota && <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 12 }}>{nota}</p>}
      {children}
    </section>
  );
}

export interface Tile {
  label: string;
  value: string;
  detalhe?: string;
  icone?: ReactNode;
  cor?: string;
}

/**
 * Números de cabeçalho.
 *
 * Valor único com sua variação é stat tile, não gráfico: uma barra só não
 * compara com nada e ocuparia dez vezes o espaço para dizer o mesmo.
 */
export function StatTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12,
      marginTop: 16
    }}>
      {tiles.map(t => (
        <div key={t.label} style={{
          border: '1px solid var(--color-border)', borderRadius: 8,
          padding: 14, background: 'var(--color-surface)'
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {t.icone && <span style={{ color: t.cor, display: 'flex' }}>{t.icone}</span>}
            <strong style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{t.value}</strong>
          </div>
          {t.detalhe && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.detalhe}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Barra de controles do painel: o mês e o botão de tabela, numa linha só. */
export function PanelToolbar({ titulo, competence, onCompetence, tabela, onTabela, extra }: {
  titulo: string;
  competence: string;
  onCompetence: (valor: string) => void;
  tabela: boolean;
  onTabela: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className={styles.toolbar}>
      <h2 className={styles.title}>{titulo}</h2>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {extra}
        <input
          type="month"
          className={styles.searchInput}
          style={{ minWidth: 0, maxWidth: 170 }}
          value={competence}
          onChange={(e) => onCompetence(e.target.value)}
        />
        <button className={styles.pageButton} onClick={onTabela}>
          {tabela ? 'Ver gráficos' : 'Ver tabela'}
        </button>
      </div>
    </div>
  );
}
