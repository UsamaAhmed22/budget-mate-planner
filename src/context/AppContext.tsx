import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  month: string;
  spent: number;
}

export interface Settings {
  currency: string;
  theme: 'light' | 'dark';
  startingBalance: number;
}

interface AppContextType {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: Settings;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: number, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: number) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  editCategory: (id: number, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
  { id: 1, name: "Osama Ahmed", email: "osama@test.com", password: "password", role: "admin" }
];

const initialCategories: Category[] = [
  { id: 1, name: "Salary", type: "income", color: "#10b981" },
  { id: 2, name: "Freelance", type: "income", color: "#34d399" },
  { id: 3, name: "Food", type: "expense", color: "#f59e0b" },
  { id: 4, name: "Transport", type: "expense", color: "#3b82f6" },
  { id: 5, name: "Rent", type: "expense", color: "#ef4444" },
  { id: 6, name: "Entertainment", type: "expense", color: "#a855f7" },
  { id: 7, name: "Bills", type: "expense", color: "#f97316" },
  { id: 8, name: "Health", type: "expense", color: "#ec4899" },
  { id: 9, name: "Other", type: "expense", color: "#6b7280" },
];

const initialTransactions: Transaction[] = [
  { id: 1, amount: 5000, type: "income", category: "Salary", date: "2025-10-01", description: "Monthly salary" },
  { id: 2, amount: 1200, type: "expense", category: "Rent", date: "2025-10-02", description: "October rent payment" },
  { id: 3, amount: 150, type: "expense", category: "Food", date: "2025-10-03", description: "Grocery shopping" },
  { id: 4, amount: 50, type: "expense", category: "Transport", date: "2025-10-03", description: "Gas for car" },
  { id: 5, amount: 800, type: "income", category: "Freelance", date: "2025-10-04", description: "Web design project" },
  { id: 6, amount: 75, type: "expense", category: "Entertainment", date: "2025-10-05", description: "Movie and dinner" },
  { id: 7, amount: 200, type: "expense", category: "Bills", date: "2025-10-05", description: "Electricity and water" },
  { id: 8, amount: 120, type: "expense", category: "Food", date: "2025-10-06", description: "Restaurant lunch" },
  { id: 9, amount: 45, type: "expense", category: "Health", date: "2025-10-06", description: "Pharmacy items" },
  { id: 10, amount: 30, type: "expense", category: "Transport", date: "2025-10-07", description: "Taxi ride" },
];

const initialBudgets: Budget[] = [
  { id: 1, category: "Food", amount: 500, month: "2025-10", spent: 270 },
  { id: 2, category: "Transport", amount: 200, month: "2025-10", spent: 80 },
  { id: 3, category: "Entertainment", amount: 300, month: "2025-10", spent: 75 },
];

const initialSettings: Settings = {
  currency: "USD",
  theme: "light",
  startingBalance: 10000,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  // Apply theme on mount and when settings change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    if (users.find(u => u.email === email)) {
      return false;
    }
    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      password,
      role: users.length === 1 ? 'admin' : 'user', // First new signup becomes admin
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: transactions.length + 1 };
    setTransactions([...transactions, newTransaction]);
    
    // Update budget spent if applicable
    if (transaction.type === 'expense') {
      const month = transaction.date.substring(0, 7);
      setBudgets(budgets.map(b => 
        b.category === transaction.category && b.month === month
          ? { ...b, spent: b.spent + transaction.amount }
          : b
      ));
    }
  };

  const editTransaction = (id: number, transaction: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...transaction, id } : t));
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget = { ...budget, id: budgets.length + 1, spent: 0 };
    setBudgets([...budgets, newBudget]);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: categories.length + 1 };
    setCategories([...categories, newCategory]);
  };

  const editCategory = (id: number, category: Omit<Category, 'id'>) => {
    setCategories(categories.map(c => c.id === id ? { ...category, id } : c));
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const resetApp = () => {
    setTransactions(initialTransactions);
    setCategories(initialCategories);
    setBudgets(initialBudgets);
    setSettings(initialSettings);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        transactions,
        categories,
        budgets,
        settings,
        login,
        signup,
        logout,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addBudget,
        addCategory,
        editCategory,
        deleteCategory,
        updateSettings,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
