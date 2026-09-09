import { useState } from 'react';

/**
 * Gráficos em SVG puro.
 *
 * As especificações de traço são fixas: linha de 2px com junta redonda, marcador
 * de raio 4 com anel de 2px na cor da superfície, barra de no máximo 24px com a
 * ponta arredondada e a base quadrada, grade de 1px sólida e recuada. O anel e o
 * respiro entre marcas são o que separa — nunca uma borda desenhada em volta.
 *
 * Texto nunca veste a cor da série: identidade vem da marca colorida ao lado.
 */

const money = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const moneyFull = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const mesCurto = (iso: string) => {
  const [ano, mes] = iso.split('-');
  const nomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${nomes[Number(mes) - 1]}/${ano.slice(2)}`;
};

/** Escala de rótulos do eixo em números redondos. */
function ticks(max: number, quantidade = 4): number[] {
  if (max <= 0) return [0];
  const bruto = max / quantidade;
  const magnitude = Math.pow(10, Math.floor(Math.log10(bruto)));
  const passo = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(p => p >= bruto) ?? magnitude * 10;
  const saida: number[] = [];
  for (let v = 0; v <= max + passo * 0.001; v += passo) saida.push(v);
  return saida;
}

export interface LineSeries {
  label: string;
  color: string;
  points: number[];
}

interface LineChartProps {
  labels: string[];
  series: LineSeries[];
  /** Formata o valor no tooltip e no rótulo do fim da linha. */
  format?: (v: number) => string;
  height?: number;
}

/**
 * Evolução no tempo. Traz crosshair e tooltip por padrão: um gráfico em tela é
 * interativo, e sem isso os valores intermediários ficam inacessíveis.
 */
export function LineChart({ labels, series, format = moneyFull, height = 240 }: LineChartProps) {
  const [ativo, setAtivo] = useState<number | null>(null);

  /** Versão curta do formatador, para o rótulo caber ao lado da linha. */
  const rotuloCurto = (v: number) =>
    format === moneyFull ? money(v) : Math.round(v).toLocaleString('pt-BR');

  const largura = 860;
  const margem = { top: 16, right: 76, bottom: 30, left: 64 };
  const areaL = largura - margem.left - margem.right;
  const areaA = height - margem.top - margem.bottom;

  const maximo = Math.max(1, ...series.flatMap(s => s.points));
  const marcas = ticks(maximo);
  const topo = marcas[marcas.length - 1];

  const x = (i: number) => margem.left + (labels.length === 1 ? areaL / 2 : (areaL * i) / (labels.length - 1));
  const y = (v: number) => margem.top + areaA - (areaA * v) / topo;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${largura} ${height}`} width="100%" height={height}
           role="img" style={{ overflow: 'visible' }}
           onMouseLeave={() => setAtivo(null)}>
        {marcas.map(m => (
          <g key={m}>
            <line x1={margem.left} x2={largura - margem.right} y1={y(m)} y2={y(m)}
                  stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={margem.left - 10} y={y(m) + 4} textAnchor="end"
                  fontSize={11} fill="var(--viz-ink-muted)">
              {m >= 1000 ? `${Math.round(m / 1000)}k` : Math.round(m)}
            </text>
          </g>
        ))}

        {labels.map((rotulo, i) => (
          <text key={rotulo} x={x(i)} y={height - 10} textAnchor="middle"
                fontSize={11} fill="var(--viz-ink-muted)">
            {mesCurto(rotulo)}
          </text>
        ))}

        {ativo !== null && (
          <line x1={x(ativo)} x2={x(ativo)} y1={margem.top} y2={margem.top + areaA}
                stroke="var(--viz-grid)" strokeWidth={1} />
        )}

        {series.map(s => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.points.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          />
        ))}

        {/* Marcador com anel na cor da superfície, para não sumir onde as linhas cruzam. */}
        {series.map(s => (
          <g key={`${s.label}-pontos`}>
            {s.points.map((v, i) => (
              (ativo === i || i === s.points.length - 1) && (
                <circle key={i} cx={x(i)} cy={y(v)} r={4}
                        fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
              )
            ))}
          </g>
        ))}

        {/* Rótulo direto só no fim da linha — nunca um número em cada ponto.
            Usa o formatador da série: contagem de páginas não é dinheiro. */}
        {series.map(s => {
          const ultimo = s.points[s.points.length - 1];
          return (
            <text key={`${s.label}-fim`} x={largura - margem.right + 8} y={y(ultimo) + 4}
                  fontSize={11} fontWeight={700} fill="var(--viz-ink)">
              {rotuloCurto(ultimo)}
            </text>
          );
        })}

        {/* Faixas de captura maiores que a marca, para o hover ser fácil de acertar. */}
        {labels.map((rotulo, i) => (
          <rect key={`hit-${rotulo}`} x={x(i) - areaL / (labels.length * 2) - 2} y={margem.top}
                width={areaL / labels.length + 4} height={areaA}
                fill="transparent" onMouseEnter={() => setAtivo(i)} />
        ))}
      </svg>

      {ativo !== null && (
        <div style={{
          position: 'absolute', top: 0,
          left: `${(x(ativo) / largura) * 100}%`,
          transform: 'translateX(-50%)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 6, padding: '8px 10px', fontSize: 12, pointerEvents: 'none',
          boxShadow: 'var(--shadow-soft)', whiteSpace: 'nowrap', zIndex: 2
        }}>
          <strong>{mesCurto(labels[ativo])}</strong>
          {series.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flex: '0 0 auto' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
              <strong style={{ marginLeft: 'auto' }}>{format(s.points[ativo])}</strong>
            </div>
          ))}
        </div>
      )}

      {series.length > 1 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          {series.map(s => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span style={{ width: 14, height: 3, borderRadius: 2, background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface BarChartProps {
  items: { name: string; value: number; hint?: string }[];
  /** Uma cor só: a barra mede magnitude, e magnitude não pede identidade. */
  color?: string;
  format?: (v: number) => string;
}

/**
 * Barra horizontal para magnitude. Horizontal porque os nomes de setor são longos
 * e girar o texto é pior que girar o gráfico.
 */
export function BarChart({ items, color = 'var(--viz-seq-4)', format = moneyFull }: BarChartProps) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const maximo = Math.max(1, ...items.map(i => i.value));

  if (items.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)', padding: '12px 0' }}>Sem dados neste mês.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={item.name} onMouseEnter={() => setAtivo(i)} onMouseLeave={() => setAtivo(null)}
             style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr auto', gap: 12, alignItems: 'center' }}>
          <span style={{
            fontSize: 13, color: 'var(--color-text)', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }} title={item.name}>
            {item.name}
            {item.hint && <span style={{ color: 'var(--color-text-muted)' }}> · {item.hint}</span>}
          </span>

          <div style={{ position: 'relative', height: 20 }}>
            <svg width="100%" height={20} viewBox="0 0 400 20" preserveAspectRatio="none">
              {/* Ponta arredondada, base quadrada: a barra cresce de uma linha só. */}
              <path
                d={barPath((item.value / maximo) * 400, 20)}
                fill={color}
                opacity={ativo === null || ativo === i ? 1 : 0.45}
              />
            </svg>
          </div>

          <strong style={{ fontSize: 13, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
            {format(item.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/** Retângulo com os 4px arredondados só no fim, e reto na base. */
function barPath(largura: number, altura: number): string {
  const r = Math.min(4, largura);
  if (largura <= 0) return '';
  return `M0,0 H${Math.max(0, largura - r)} Q${largura},0 ${largura},${r} V${altura - r} Q${largura},${altura} ${Math.max(0, largura - r)},${altura} H0 Z`;
}
