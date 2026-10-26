export function RainSunCloudIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
        <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="rain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Sun rays & orb */}
      <circle cx="44" cy="22" r="12" fill="url(#sun-glow)" filter="url(#glow-filter)" />
      
      {/* Cloud body */}
      <path
        d="M20 44H42C46.4183 44 50 40.4183 50 36C50 31.8565 46.8488 28.4488 42.8 28.04C41.7333 22.3486 36.7828 18 30.8 18C24.0863 18 18.5714 23.2386 18.2 29.88C14.7 30.6 12 33.6 12 37.2C12 40.9555 15.0445 44 18.8 44H20Z"
        fill="url(#cloud-grad)"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 70, 180, 0.4))' }}
      />
      
      {/* Rain droplets */}
      <g stroke="url(#rain-grad)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="22" y1="48" x2="19" y2="55" />
        <line x1="30" y1="48" x2="27" y2="55" />
        <line x1="38" y1="48" x2="35" y2="55" />
      </g>
    </svg>
  );
}

export function RainCloudIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 30H32C35.3137 30 38 27.3137 38 24C38 20.8924 35.6366 18.3366 32.6 18.03C31.8 13.7614 28.0869 10.5 23.6 10.5C18.5647 10.5 14.4285 14.4289 14.15 19.41C11.525 19.95 9.5 22.2 9.5 24.9C9.5 27.7167 11.7833 30 14.6 30H14Z"
        fill="#3b82f6"
      />
      <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
        <line x1="17" y1="34" x2="15" y2="39" />
        <line x1="24" y1="34" x2="22" y2="39" />
        <line x1="31" y1="34" x2="29" y2="39" />
      </g>
    </svg>
  );
}

export function PartlyCloudyIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="31" cy="18" r="8" fill="#facc15" />
      <path
        d="M14 32H30C33.3137 32 36 29.3137 36 26C36 22.8924 33.6366 20.3366 30.6 20.03C29.8 15.7614 26.0869 12.5 21.6 12.5C16.5647 12.5 12.4285 16.4289 12.15 21.41C9.525 21.95 7.5 24.2 7.5 26.9C7.5 29.7167 9.7833 32 12.6 32H14Z"
        fill="#60a5fa"
      />
    </svg>
  );
}

export function SunnyIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" fill="#facc15" />
      <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
        <line x1="24" y1="6" x2="24" y2="10" />
        <line x1="24" y1="38" x2="24" y2="42" />
        <line x1="6" y1="24" x2="10" y2="24" />
        <line x1="38" y1="24" x2="42" y2="24" />
        <line x1="11.27" y1="11.27" x2="14.1" y2="14.1" />
        <line x1="33.9" y1="33.9" x2="36.73" y2="36.73" />
        <line x1="11.27" y1="36.73" x2="14.1" y2="33.9" />
        <line x1="33.9" y1="14.1" x2="36.73" y2="11.27" />
      </g>
    </svg>
  );
}

export function MoonStarsIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M26 12C20.4772 12 16 16.4772 16 22C16 27.5228 20.4772 32 26 32C29.0833 32 31.8415 30.6053 33.6826 28.4069C31.2588 28.7967 28.6659 27.9171 26.8579 26.1091C25.0498 24.3011 24.1702 21.7081 24.56 19.2844C22.3616 21.1255 20.9669 23.8837 20.9669 26.9669"
        fill="#e0f2fe"
      />
      <circle cx="34" cy="14" r="1.5" fill="#38bdf8" />
      <circle cx="38" cy="20" r="1" fill="#7dd3fc" />
    </svg>
  );
}

export function MoonCloudIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 14C23.5817 14 20 17.5817 20 22C20 23.4 20.36 24.71 21 25.86C20.67 25.81 20.34 25.79 20 25.79C16.6863 25.79 14 28.4763 14 31.79H29C32.3137 31.79 35 29.1037 35 25.79C35 23.23 33.39 21.05 31.11 20.21C31.68 18.96 32 17.56 32 16.08C30.69 16.08 29.43 16.43 28.34 17.06C28.12 15.34 28 14 28 14Z"
        fill="#60a5fa"
      />
    </svg>
  );
}
