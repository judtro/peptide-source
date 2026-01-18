import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await adminLogin(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/admin');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(201,96%,32%,0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-md bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl text-[hsl(210,40%,98%)]">Admin Access</CardTitle>
            <CardDescription className="text-[hsl(215,20%,60%)]">
              ChemVerify Control Panel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-[hsl(210,40%,98%)]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@chemverify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-[hsl(210,40%,98%)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)]"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Authenticate
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[hsl(215,25%,20%)]">
            <p className="text-xs text-center text-[hsl(215,20%,50%)]">
              Authorized personnel only. All access attempts are logged.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
