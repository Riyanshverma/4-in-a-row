export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="4 in a Row logo"
    >
      <rect x="2" y="2" width="28" height="28" rx="4" className="fill-board-blue" />
      <circle cx="10" cy="10" r="3.2" className="fill-primary" />
      <circle cx="18" cy="10" r="3.2" className="fill-secondary" />
      <circle cx="10" cy="18" r="3.2" className="fill-secondary" />
      <circle cx="18" cy="18" r="3.2" className="fill-primary" />
      <circle cx="24" cy="24" r="3.2" className="fill-primary" />
    </svg>
  )
}
