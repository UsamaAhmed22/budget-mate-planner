import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AddEditTransactionModal } from '@/components/AddEditTransactionModal';
import { Transaction } from '@/context/AppContext';

const Dashboard = () => {
  const { currentUser, transactions, categories, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const currentMonth = new Date().toISOString().substring(0, 7);
  
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = settings.startingBalance + transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Prepare chart data
  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: monthTransactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      color: cat.color,
    }))
    .filter(item => item.value > 0);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return symbols[currency] || '$';
  };

  const symbol = getCurrencySymbol(settings.currency);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Hello, {currentUser?.name.split(' ')[0] || 'Guest'} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Welcome to your financial overview</p>
          </div>
          <Button onClick={handleAddNew} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Starting Balance"
            value={`${symbol}${settings.startingBalance.toFixed(2)}`}
            icon={Wallet}
            variant="default"
          />
          <SummaryCard
            title="Current Balance"
            value={`${symbol}${currentBalance.toFixed(2)}`}
            icon={DollarSign}
            variant="default"
          />
          <SummaryCard
            title="Monthly Income"
            value={`${symbol}${monthlyIncome.toFixed(2)}`}
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Monthly Expenses"
            value={`${symbol}${monthlyExpenses.toFixed(2)}`}
            icon={TrendingDown}
            variant="expense"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-card p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap + to add one!</p>
                </div>
              ) : (
                recentTransactions.map(transaction => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Spending Chart */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Spending Overview</h2>
            {expensesByCategory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses this month</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${symbol}${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Dashboard;
