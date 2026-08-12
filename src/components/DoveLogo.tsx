export function DoveLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 8c-2 0-4 1.5-5 3.5C25 8 22 6 18 6c-6 0-10 5-10 11 0 8 8 16 14 22 3 3 6 5 10 5s7-2 10-5c6-6 14-14 14-22 0-6-4-11-10-11-4 0-7 2-9 5.5C36 9.5 34 8 32 8z" opacity="0.3" />
      <path d="M32 12c-1.5 0-3 1-3.5 2.5C27 12 24.5 10 21 10c-4.5 0-7.5 3.5-7.5 8 0 6 6.5 12.5 11.5 17 2.5 2.5 5 4 7 4s4.5-1.5 7-4c5-4.5 11.5-11 11.5-17 0-4.5-3-8-7.5-8-3.5 0-6 2-7.5 4.5C35 13 33.5 12 32 12z" />
      <path d="M28 28c-1 2-2 4-2 6 0 3 2 5 4 5h8c2 0 4-2 4-5 0-2-1-4-2-6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="32" cy="22" r="2" opacity="0.6" />
    </svg>
  );
}
