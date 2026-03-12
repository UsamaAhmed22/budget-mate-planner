import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { LogOut, RotateCcw, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const Settings = () => {
  const { currentUser, settings, updateSettings, logout, resetApp } = useApp();
  const navigate = useNavigate();
  const [startingBalance, setStartingBalance] = useState(settings.startingBalance.toString());

  useEffect(() => {
    setStartingBalance(settings.startingBalance.toString());
  }, [settings.startingBalance]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    navigate('/login');
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      try {
        await resetApp();
        toast({
          title: "Reset complete",
          description: "All data has been reset to defaults",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Reset failed',
          variant: 'destructive',
        });
      }
    }
  };

  const handleThemeToggle = async (checked: boolean) => {
    try {
      await updateSettings({ theme: checked ? 'dark' : 'light' });
      toast({
        title: "Theme updated",
        description: `Switched to ${checked ? 'dark' : 'light'} mode`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Update failed',
        variant: 'destructive',
      });
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    try {
      await updateSettings({ currency });
      toast({
        title: "Currency updated",
        description: `Currency changed to ${currency}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Update failed',
        variant: 'destructive',
      });
    }
  };

  const handleStartingBalanceSave = async () => {
    if (currentUser?.role !== 'admin') {
      toast({
        title: 'Admin only',
        description: 'Only admin can update household starting balance',
        variant: 'destructive',
      });
      return;
    }

    const parsed = Number(startingBalance);
    if (Number.isNaN(parsed)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid starting balance',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSettings({ startingBalance: parsed });
      toast({
        title: 'Starting balance updated',
        description: 'Household opening balance has been saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Update failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences</p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-foreground font-medium">{currentUser?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-foreground font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="text-foreground font-medium capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6 shadow-card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Preferences</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={settings.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starting-balance">Starting Balance (Household)</Label>
            <div className="flex gap-2">
              <Input
                id="starting-balance"
                type="number"
                step="0.01"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                placeholder="Enter household starting balance"
              />
              <Button onClick={handleStartingBalanceSave}>
                Save
              </Button>
            </div>
            {currentUser?.role !== 'admin' && (
              <p className="text-xs text-muted-foreground">Only admin can change household starting balance.</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch
              id="theme"
              checked={settings.theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </Card>

        {/* Actions Section */}
        <Card className="p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Actions</h2>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Data
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
