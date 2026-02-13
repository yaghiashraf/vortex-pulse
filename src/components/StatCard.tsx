interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: "green" | "red" | "blue" | "amber" | "purple" | "cyan" | "default";
  icon?: string;
}

const colorMap = {
  green: "text-vortex-green",
  red: "text-vortex-red",
  blue: "text-vortex-accent-bright",
  amber: "text-vortex-amber",
  purple: "text-vortex-purple",
  cyan: "text-vortex-cyan",
  default: "text-vortex-text-bright",
};

export default function StatCard({ label, value, subValue, color = "default", icon }: StatCardProps) {
  return (
    <div className="stat-card bg-vortex-card border border-vortex-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-vortex-muted">{label}</span>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <div className={`text-xl font-bold font-mono ${colorMap[color]}`}>{value}</div>
      {subValue && (
        <div className="text-[10px] text-vortex-muted mt-0.5">{subValue}</div>
      )}
    </div>
  );
}
