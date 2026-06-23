const COLORS = [
  'bg-cente-blue-500',
  'bg-cente-yellow-600 text-ink-700',
  'bg-success',
  'bg-cente-red-500',
  'bg-ink-500',
];

function colorFor(seed: string) {
  const sum = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

interface Props {
  initials: string;
}

export default function Avatar({ initials }: Props) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${colorFor(initials)}`}
    >
      {initials}
    </span>
  );
}
