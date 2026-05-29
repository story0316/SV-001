"use client";
import { RiskLevel } from "@/types";
import { RISK_CONFIG } from "@/lib/utils";

interface Props {
  score: number;
  level: RiskLevel;
  factors: string[];
}

export function RiskScoreBar({ score, level, factors }: Props) {
  const cfg = RISK_CONFIG[level];
  const pct = Math.min(100, score);

  const barColor =
    level === "critical" ? "bg-red-500" :
    level === "high"     ? "bg-amber-500" :
    level === "medium"   ? "bg-yellow-400" :
                           "bg-green-500";

  return (
    <div className={`rounded-xl p-4 ${cfg.bg} border ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <span className={`text-base font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className={`text-2xl font-bold ${cfg.text}`}>{score}점</span>
      </div>

      <div className="h-3 bg-white/60 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {factors.length > 0 && (
        <ul className="space-y-1">
          {factors.map((f, i) => (
            <li key={i} className={`text-sm ${cfg.text} flex items-center gap-1.5`}>
              <span>•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
