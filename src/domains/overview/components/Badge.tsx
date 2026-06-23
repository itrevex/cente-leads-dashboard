const COLOR_CLASSES: Record<string, string> = {
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-200',
  yellow:
    'bg-cente-yellow-100 text-cente-yellow-700 dark:bg-cente-yellow-700/20 dark:text-cente-yellow-500',
  blue: 'bg-cente-blue-100 text-cente-blue-700 dark:bg-cente-blue-700/20 dark:text-cente-blue-300',
  green: 'bg-success-soft text-success dark:bg-success/20 dark:text-success',
  red: 'bg-cente-red-100 text-cente-red-700 dark:bg-cente-red-700/20 dark:text-cente-red-500',
};

interface Props {
  label: string;
  color: 'neutral' | 'yellow' | 'blue' | 'green' | 'red';
}

export default function Badge({ label, color }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium ${COLOR_CLASSES[color]}`}
    >
      {label}
    </span>
  );
}
