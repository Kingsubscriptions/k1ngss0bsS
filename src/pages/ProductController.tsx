import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface LoginProps {
  onLogin: () => void;
}

const LoginForm: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use environment variable for password in production
  const ADMIN_PASSWORD = import.meta.env.VITE_PRODUCT_CONTROLLER_PASSWORD || 'admin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for security
    // await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const { token } = await apiClient.loginProductController(password);

      // Set session in localStorage
      localStorage.setItem('productController_auth', 'authenticated');
      localStorage.setItem('productController_loginTime', Date.now().toString());
      localStorage.setItem('admin_token', token); // Store token for API requests
      onLogin();
    } catch (err) {
      setError('Invalid password. Access denied.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-slate-700">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Product Controller</CardTitle>
          <CardDescription className="text-slate-400">
            Enter password to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10 bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="border-red-600 bg-red-900/20">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Authenticating...' : 'Access Controller'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ProductController: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('productController_auth');
    const loginTime = localStorage.getItem('productController_loginTime');

    if (auth === 'authenticated' && loginTime) {
      // Check if session is still valid (24 hours)
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      const isSessionValid = Date.now() - parseInt(loginTime) < sessionDuration;

      if (isSessionValid) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear auth
        localStorage.removeItem('productController_auth');
        localStorage.removeItem('productController_loginTime');
        localStorage.removeItem('admin_token'); // Also clear token
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('productController_auth');
    localStorage.removeItem('productController_loginTime');
    localStorage.removeItem('admin_token'); // Clear token on logout
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-lg text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Import Dashboard component here to avoid loading it unless authenticated
  const Dashboard = React.lazy(() => import('./ProductDashboard'));

  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900">Loading dashboard...</div>}>
      <Dashboard onLogout={handleLogout} />
    </React.Suspense>
  );
};

export default ProductController;
