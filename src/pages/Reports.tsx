import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Reports = () => {
  const { transactions, categories, settings } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Pie chart data - expenses by category
  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: monthTransactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      color: cat.color,
    }))
    .filter(item => item.value > 0);

  // Bar chart data - income vs expenses
  const barData = [
    { name: 'Income', amount: monthlyIncome, fill: 'hsl(var(--success))' },
    { name: 'Expenses', amount: monthlyExpenses, fill: 'hsl(var(--destructive))' },
  ];

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return symbols[currency] || '$';
  };

  const symbol = getCurrencySymbol(settings.currency);

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().substring(0, 7);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Analyze your financial data</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 border-0 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-3xl font-bold text-success mt-2">{symbol}{monthlyIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-6 border-0 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold text-destructive mt-2">{symbol}{monthlyExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-0 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">Net Savings</p>
            <p className={`text-3xl font-bold mt-2 ${monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive'}`}>
              {symbol}{(monthlyIncome - monthlyExpenses).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Expenses by Category</h2>
            {expensesByCategory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses for this month</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${symbol}${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => `${symbol}${value.toFixed(2)}`} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
