import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Wallet } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useApp();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentUser, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
      <div className="text-center animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg mb-6 animate-bounce">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-2">BudgetMate</h1>
        <p className="text-white/80 text-lg">Your Personal Finance Companion</p>
      </div>
    </div>
  );
};

export default SplashScreen;
