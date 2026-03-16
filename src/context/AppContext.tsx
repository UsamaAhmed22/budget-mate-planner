import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, apiRequest } from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
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
  isLoading: boolean;
  isRealtimeConnected: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: number, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  editCategory: (id: number, category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

const initialTransactions: Transaction[] = [];

const initialBudgets: Budget[] = [];

const initialSettings: Settings = {
  currency: "USD",
  theme: "light",
  startingBalance: 10000,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bm_token'));

  const setAuth = (authToken: string | null, user: User | null) => {
    if (authToken) {
      localStorage.setItem('bm_token', authToken);
      setToken(authToken);
    } else {
      localStorage.removeItem('bm_token');
      setToken(null);
    }

    if (user) {
      localStorage.setItem('bm_user', JSON.stringify(user));
      setCurrentUser(user);
    } else {
      localStorage.removeItem('bm_user');
      setCurrentUser(null);
    }
  };

  const loadBootstrap = async (authToken: string) => {
    const data = await apiRequest<{
      transactions: Transaction[];
      categories: Category[];
      budgets: Budget[];
      settings: Settings;
    }>('/bootstrap', { token: authToken });

    setTransactions(data.transactions);
    setCategories(data.categories);
    setBudgets(data.budgets);
    setSettings(data.settings);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('bm_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('bm_user');
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await loadBootstrap(token);
      } catch {
        setAuth(null, null);
        setTransactions(initialTransactions);
        setCategories(initialCategories);
        setBudgets(initialBudgets);
        setSettings(initialSettings);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsRealtimeConnected(false);
      return;
    }

    const eventsUrl = `${API_BASE_URL}/events?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(eventsUrl);

    const onConnected = () => setIsRealtimeConnected(true);
    const onError = () => setIsRealtimeConnected(false);

    const refreshData = () => {
      setIsRealtimeConnected(true);
      void loadBootstrap(token).catch(() => {
        // Ignore transient realtime sync errors.
      });
    };

    eventSource.addEventListener('connected', onConnected);
    eventSource.addEventListener('error', onError as EventListener);
    eventSource.addEventListener('refresh', refreshData);

    return () => {
      setIsRealtimeConnected(false);
      eventSource.removeEventListener('connected', onConnected);
      eventSource.removeEventListener('error', onError as EventListener);
      eventSource.removeEventListener('refresh', refreshData);
      eventSource.close();
    };
  }, [token]);

  // Apply theme on mount and when settings change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(result.token, result.user);
      await loadBootstrap(result.token);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiRequest<{ token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setAuth(result.token, result.user);
      await loadBootstrap(result.token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setAuth(null, null);
    setTransactions(initialTransactions);
    setCategories(initialCategories);
    setBudgets(initialBudgets);
    setSettings(initialSettings);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!token) return;

    const created = await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      token,
      body: JSON.stringify(transaction),
    });
    setTransactions((prev) => [created, ...prev]);
  };

  const editTransaction = async (id: number, transaction: Omit<Transaction, 'id'>) => {
    if (!token) return;

    const updated = await apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(transaction),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTransaction = async (id: number) => {
    if (!token) return;

    await apiRequest<void>(`/transactions/${id}`, {
      method: 'DELETE',
      token,
    });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!token) return;

    const created = await apiRequest<Budget>('/budgets', {
      method: 'POST',
      token,
      body: JSON.stringify(budget),
    });
    setBudgets((prev) => [...prev, created]);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!token) return;

    const created = await apiRequest<Category>('/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(category),
    });
    setCategories((prev) => [...prev, created]);
  };

  const editCategory = async (id: number, category: Omit<Category, 'id'>) => {
    if (!token) return;

    const updated = await apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(category),
    });
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCategory = async (id: number) => {
    if (!token) return;

    await apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
      token,
    });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!token) return;

    const updated = await apiRequest<Settings>('/settings', {
      method: 'PATCH',
      token,
      body: JSON.stringify(newSettings),
    });
    setSettings(updated);
  };

  const resetApp = async () => {
    if (!token) return;

    const data = await apiRequest<{
      transactions: Transaction[];
      categories: Category[];
      budgets: Budget[];
      settings: Settings;
    }>('/reset', {
      method: 'POST',
      token,
    });

    setTransactions(data.transactions);
    setCategories(data.categories);
    setBudgets(data.budgets);
    setSettings(data.settings);
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
        isLoading,
        isRealtimeConnected,
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
