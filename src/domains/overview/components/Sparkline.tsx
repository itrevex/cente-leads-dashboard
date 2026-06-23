interface Props {
  data: number[];
}

export default function Sparkline({ data }: Props) {
  const max = Math.max(...data);
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-xs ${
            i === data.length - 1
              ? 'bg-cente-blue-600'
              : 'bg-cente-blue-200 dark:bg-cente-blue-700/40'
          }`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
