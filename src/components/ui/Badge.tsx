import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  default: "bg-navy-100 text-navy-700",
  gold: "bg-gold-100 text-gold-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
};

export function Badge({
  color = "default",
  className,
  children,
}: {
  color?: keyof typeof colors;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
