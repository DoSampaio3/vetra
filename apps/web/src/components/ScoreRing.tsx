'use client';

interface ScoreRingProps {
  score: number;
  size?: number;
  level?: string;
}

function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    very_high: '#68d391',
    high: '#90cdf4',
    medium: '#f6e05e',
    low: '#ed8936',
    very_low: '#fc8181',
  };
  return colors[level] || colors.medium;
}

function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    very_high: 'Excelente',
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
    very_low: 'Muito Baixo',
  };
  return labels[level] || level;
}

export function ScoreRing({ score, size = 140, level = 'medium' }: ScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getLevelColor(level);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease',
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size > 100 ? '30px' : '22px',
            fontWeight: 400,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
          }}
        >
          {getLevelLabel(level)}
        </span>
      </div>
    </div>
  );
}
