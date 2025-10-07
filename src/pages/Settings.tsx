import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { LogOut, RotateCcw, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { currentUser, settings, updateSettings, logout, resetApp } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    navigate('/login');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetApp();
      toast({
        title: "Reset complete",
        description: "All data has been reset to defaults",
      });
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    updateSettings({ theme: checked ? 'dark' : 'light' });
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? 'dark' : 'light'} mode`,
    });
  };

  const handleCurrencyChange = (currency: string) => {
    updateSettings({ currency });
    toast({
      title: "Currency updated",
      description: `Currency changed to ${currency}`,
    });
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
