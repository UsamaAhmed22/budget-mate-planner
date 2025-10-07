interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export const ProgressBar = ({ value, max, color = 'hsl(var(--primary))' }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOverBudget = value > max;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">
          ${value.toFixed(2)} / ${max.toFixed(2)}
        </span>
        <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? 'hsl(var(--destructive))' : color,
          }}
        />
      </div>
    </div>
  );
};
