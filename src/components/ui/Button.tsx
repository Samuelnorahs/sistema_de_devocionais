import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-300 disabled:bg-gold-300",
  secondary:
    "bg-navy-800 text-white hover:bg-navy-900 focus:ring-navy-400 disabled:bg-navy-400",
  outline:
    "border-2 border-gold-500 text-gold-700 hover:bg-gold-50 focus:ring-gold-300",
  ghost: "text-navy-600 hover:bg-gold-100 focus:ring-gold-200",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
