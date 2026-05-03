export default function VeritasLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="22" fill="#0a0f1e" />
      {/* Cross */}
      <rect x="44" y="18" width="12" height="64" rx="4" fill="url(#goldGrad)" />
      <rect x="22" y="36" width="56" height="12" rx="4" fill="url(#goldGrad)" />
      {/* Glow overlay */}
      <rect x="44" y="18" width="12" height="64" rx="4" fill="url(#glowGrad)" opacity="0.4" />
      <defs>
        <linearGradient id="goldGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}