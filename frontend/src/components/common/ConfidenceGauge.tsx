import { useTheme } from '../../context/ThemeContext';

interface ConfidenceGaugeProps {
  score?: number;
  label?: string;
  status?: string;
}

export default function ConfidenceGauge({
  score = 87,
  label = "Forecast Confidence",
  status = "High confidence"
}: ConfidenceGaugeProps) {
  const { theme } = useTheme();
  const radius = 32;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4 bg-transparent">
      {/* Radial Gauge */}
      <div className="relative w-[78px] h-[78px] flex items-center justify-center flex-shrink-0">
        <svg height={radius * 2 + 16} width={radius * 2 + 16} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            stroke={theme === 'light' ? '#e2e8f0' : 'rgba(30, 58, 110, 0.45)'}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius + 8}
            cy={radius + 8}
          />
          {/* Glowing cyan/sky progress stroke */}
          <circle
            stroke={theme === 'light' ? '#0284c7' : '#00d2ff'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius + 8}
            cy={radius + 8}
            className="transition-all duration-1000 ease-out"
            filter={theme === 'light' ? 'drop-shadow(0 0 4px rgba(2, 132, 199, 0.5))' : 'drop-shadow(0 0 6px rgba(0, 210, 255, 0.8))'}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {score}%
          </span>
        </div>
      </div>

      {/* Label and Sub-status */}
      <div className="flex flex-col">
        <span className={`text-sm font-bold tracking-normal ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          {label}
        </span>
        <span className={`text-xs font-semibold mt-0.5 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
