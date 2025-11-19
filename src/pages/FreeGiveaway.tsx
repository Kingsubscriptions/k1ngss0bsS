import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGiveaway } from '@/context/GiveawayContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Copy, Eye, EyeOff, Gift, Lock } from 'lucide-react';
import { toast } from 'sonner';

const FreeGiveaway: React.FC = () => {
  const { accounts, isLoading, error } = useGiveaway();
  const { isAuthenticated } = useAuth();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const togglePassword = (id: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Premium Giveaways
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exclusive premium accounts for our community members.
            Login to access Netflix, Spotify, and more for free!
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto text-center border-2 border-primary/20">
            <CardContent className="p-8">
              <Lock className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-2xl font-bold mb-4">Member Access Only</h2>
              <p className="text-muted-foreground mb-8">
                Please log in or sign up to view our active giveaways and claim your free premium account.
              </p>
              <div className="flex flex-col gap-4">
                <Link to="/login">
                  <Button size="lg" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="w-full">Create Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            {accounts.length === 0 ? (
              <Card className="text-center p-12">
                <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Giveaways</h3>
                <p className="text-muted-foreground">
                  Check back later! We restock premium accounts weekly.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow border-primary/10">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Premium Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email / Username</label>
                        <div className="flex gap-2">
                          <code className="flex-1 bg-muted p-2 rounded border text-sm font-mono truncate">
                            {account.email}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(account.email, 'Email')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                        <div className="flex gap-2">
                          <code className="flex-1 bg-muted p-2 rounded border text-sm font-mono truncate">
                            {visiblePasswords[account.id] ? account.password : '••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePassword(account.id)}
                          >
                            {visiblePasswords[account.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(account.password || '', 'Password')}
                            disabled={!account.password}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 text-xs text-center text-muted-foreground">
                        Posted: {new Date(account.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeGiveaway;
