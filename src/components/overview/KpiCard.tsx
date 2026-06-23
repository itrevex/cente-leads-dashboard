import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Props {
  label: string;
  icon: LucideIcon;
  value: number;
  delta: string;
  deltaDir?: 'up' | 'down' | 'flat';
  brand?: boolean;
}

const deltaIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };
const deltaColor = {
  up: 'text-success',
  down: 'text-cente-red-600',
  flat: 'text-ink-400',
};

export default function KpiCard({
  label,
  icon: Icon,
  value,
  delta,
  deltaDir = 'flat',
  brand,
}: Props) {
  const DeltaIcon = deltaIcon[deltaDir];
  return (
    <div
      className={`rounded-md border p-5 ${
        brand
          ? 'border-cente-blue-600 bg-cente-blue-600 text-white'
          : 'border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800'
      }`}
    >
      <div
        className={`mb-2 flex items-center gap-2 text-sm ${
          brand ? 'text-white/85' : 'text-ink-500 dark:text-ink-300'
        }`}
      >
        <Icon size={16} />
        {label}
      </div>
      <div
        className={`text-3xl font-bold ${brand ? 'text-white' : 'text-ink-700 dark:text-ink-50'}`}
      >
        {value}
      </div>
      <div
        className={`mt-2 flex items-center gap-1.5 text-xs ${
          brand ? 'text-white/75' : deltaColor[deltaDir]
        }`}
      >
        <DeltaIcon size={13} />
        {delta}
      </div>
    </div>
  );
}
