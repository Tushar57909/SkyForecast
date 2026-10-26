import { Clock, Droplets } from 'lucide-react';
import {
  RainCloudIcon,
  PartlyCloudyIcon,
  SunnyIcon,
  MoonStarsIcon,
  MoonCloudIcon
} from '../common/WeatherIcons';
import { useTheme } from '../../context/ThemeContext';

interface HourlyForecastItem {
  time: string;
  icon: 'rain' | 'partly-cloudy' | 'sunny' | 'moon-stars' | 'moon-cloud';
  temp: number;
  pop: number;
  yPercent: number;
}

const HOURLY_DATA: HourlyForecastItem[] = [
  { time: 'NOW', icon: 'rain', temp: 28, pop: 42, yPercent: 62 },
  { time: '+3H', icon: 'rain', temp: 29, pop: 35, yPercent: 55 },
  { time: '+6H', icon: 'partly-cloudy', temp: 30, pop: 28, yPercent: 48 },
  { time: '+9H', icon: 'partly-cloudy', temp: 32, pop: 12, yPercent: 32 },
  { time: '+12H', icon: 'sunny', temp: 31, pop: 12, yPercent: 40 },
  { time: '+18H', icon: 'moon-stars', temp: 31, pop: 8, yPercent: 40 },
  { time: '+24H', icon: 'moon-cloud', temp: 28, pop: 6, yPercent: 62 }
];

export default function HourlyWaveChart() {
  const { theme } = useTheme();

  const points = [
    { x: 50, y: 62 },
    { x: 190, y: 55 },
    { x: 330, y: 48 },
    { x: 470, y: 32 },
    { x: 610, y: 40 },
    { x: 750, y: 40 },
    { x: 890, y: 62 }
  ];

  const curvePath = "M 50 62 C 120 62, 120 55, 190 55 C 260 55, 260 48, 330 48 C 400 48, 400 32, 470 32 C 540 32, 540 40, 610 40 C 680 40, 680 40, 750 40 C 820 40, 820 62, 890 62";
  const areaPath = `${curvePath} L 890 100 L 50 100 Z`;

  return (
    <div className="aeris-card px-6 py-4.5 rounded-2xl relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-sky-400'}`} />
        <span className={`text-sm font-semibold tracking-wide ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          Next 24 Hours
        </span>
      </div>

      {/* Main Grid for columns */}
      <div className="relative pt-2 pb-1">
        {/* Background SVG wave line */}
        <div className="absolute inset-0 top-10 pointer-events-none z-0">
          <svg
            viewBox="0 0 940 100"
            preserveAspectRatio="none"
            className="w-full h-16 opacity-85"
          >
            <defs>
              <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme === 'light' ? '#0284c7' : '#00d2ff'} stopOpacity={theme === 'light' ? 0.22 : 0.25} />
                <stop offset="100%" stopColor={theme === 'light' ? '#38bdf8' : '#0066ff'} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path d={areaPath} fill="url(#wave-gradient)" />
            {/* Stroke with glow */}
            <path
              d={curvePath}
              fill="none"
              stroke={theme === 'light' ? '#0284c7' : '#00d2ff'}
              strokeWidth="2.5"
              filter={theme === 'light' ? 'drop-shadow(0 2px 4px rgba(2, 132, 199, 0.4))' : 'drop-shadow(0 0 6px rgba(0, 210, 255, 0.9))'}
            />
            {/* Data circles */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#ffffff"
                stroke={theme === 'light' ? '#0284c7' : '#00d2ff'}
                strokeWidth="2"
                filter={theme === 'light' ? 'drop-shadow(0 1px 3px rgba(2, 132, 199, 0.5))' : 'drop-shadow(0 0 4px rgba(0, 210, 255, 1))'}
              />
            ))}
          </svg>
        </div>

        {/* 7 Columns */}
        <div className="grid grid-cols-7 relative z-10 text-center">
          {HOURLY_DATA.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              {/* Time Label */}
              <span className={`text-[11px] font-semibold tracking-wider mb-2 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {item.time}
              </span>

              {/* Weather Icon */}
              <div className="h-8 flex items-center justify-center mb-6">
                {item.icon === 'rain' && <RainCloudIcon className="w-6 h-6" />}
                {item.icon === 'partly-cloudy' && <PartlyCloudyIcon className="w-6 h-6" />}
                {item.icon === 'sunny' && <SunnyIcon className="w-6 h-6" />}
                {item.icon === 'moon-stars' && <MoonStarsIcon className="w-6 h-6" />}
                {item.icon === 'moon-cloud' && <MoonCloudIcon className="w-6 h-6" />}
              </div>

              {/* Temperature */}
              <span className={`text-base font-bold mt-1 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {item.temp}°C
              </span>

              {/* Rain Probability with Droplet */}
              <div className={`flex items-center gap-1 text-[11px] font-medium mt-1 ${
                theme === 'light' ? 'text-sky-600' : 'text-sky-400'
              }`}>
                <Droplets className={`w-3 h-3 ${theme === 'light' ? 'fill-sky-600/30' : 'fill-sky-400/30'}`} />
                <span>{item.pop}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
