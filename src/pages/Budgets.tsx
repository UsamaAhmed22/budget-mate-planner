import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { Plus } from 'lucide-react';
import { AddBudgetModal } from '@/components/AddBudgetModal';
import { CategoryTag } from '@/components/CategoryTag';

const Budgets = () => {
  const { budgets, categories, transactions } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Calculate spent amounts dynamically
  const budgetsWithSpent = budgets
    .filter(b => b.month === currentMonth)
    .map(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category && 
          t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      const categoryData = categories.find(c => c.name === budget.category);
      return { ...budget, spent, categoryData };
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground mt-1">Track your spending limits</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Budget
          </Button>
        </div>

        {/* Budgets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetsWithSpent.length === 0 ? (
            <div className="col-span-full bg-card rounded-2xl shadow-card p-12 border border-border text-center">
              <p className="text-muted-foreground">No budgets set for this month</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Budget" to create one</p>
            </div>
          ) : (
            budgetsWithSpent.map(budget => (
              <div key={budget.id} className="bg-card rounded-2xl shadow-card p-6 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{budget.category}</h3>
                  {budget.categoryData && (
                    <CategoryTag 
                      name={budget.categoryData.name} 
                      color={budget.categoryData.color} 
                    />
                  )}
                </div>
                <ProgressBar
                  value={budget.spent}
                  max={budget.amount}
                  color={budget.categoryData?.color || 'hsl(var(--primary))'}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {budget.spent > budget.amount ? 'Over budget' : 'Remaining'}
                  </span>
                  <span className={budget.spent > budget.amount ? 'text-destructive font-medium' : 'text-success font-medium'}>
                    ${Math.abs(budget.amount - budget.spent).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Budgets;
