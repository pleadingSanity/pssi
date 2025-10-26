interface GaugeProps {
  label: string;
  value: number;
  unit?: string;
  max?: number;
}

function Gauge({ label, value, unit = '%', max = 100 }: GaugeProps) {
  const percentage = (value / max) * 100;
  const color =
    percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold">
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Gauge;
