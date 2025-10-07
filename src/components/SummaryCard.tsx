import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'income' | 'expense';
}

export const SummaryCard = ({ title, value, icon: Icon, trend, variant = 'default' }: SummaryCardProps) => {
  const variants = {
    default: 'from-primary/10 to-primary/5',
    income: 'from-success/10 to-success/5',
    expense: 'from-destructive/10 to-destructive/5',
  };

  const iconVariants = {
    default: 'bg-primary text-primary-foreground',
    income: 'bg-success text-success-foreground',
    expense: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${variants[variant]} border-0 shadow-card hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconVariants[variant]} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
