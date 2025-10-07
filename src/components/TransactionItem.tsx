import { Transaction } from '@/context/AppContext';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { CategoryTag } from './CategoryTag';
import { useApp } from '@/context/AppContext';

interface TransactionItemProps {
  transaction: Transaction;
  onClick: () => void;
}

export const TransactionItem = ({ transaction, onClick }: TransactionItemProps) => {
  const { categories, settings } = useApp();
  const category = categories.find(c => c.name === transaction.category);
  const isIncome = transaction.type === 'income';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
    };
    return symbols[currency] || '$';
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-card hover:bg-secondary/50 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isIncome ? 'bg-success/10' : 'bg-destructive/10'}`}>
          {isIncome ? (
            <ArrowUpCircle className="w-5 h-5 text-success" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
            {category && <CategoryTag name={category.name} color={category.color} />}
          </div>
        </div>
      </div>
      <p className={`font-semibold ${isIncome ? 'text-success' : 'text-destructive'}`}>
        {isIncome ? '+' : '-'}{getCurrencySymbol(settings.currency)}{transaction.amount.toFixed(2)}
      </p>
    </div>
  );
};
