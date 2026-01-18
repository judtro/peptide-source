import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Mail, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { adminLogin, adminSignUp } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await adminLogin(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/admin');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await adminSignUp(email, password);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess('Account created! An admin must now assign your role. Contact your administrator or run the SQL command to grant admin access.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[hsl(222,47%,7%)]">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary/20">
                <Lock className="mr-2 h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="mt-4">
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
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[hsl(210,40%,98%)]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[hsl(210,40%,98%)]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,40%)]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-[hsl(210,40%,98%)]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-[hsl(215,20%,50%)] mt-2">
                  Note: After signup, an existing admin must grant you admin privileges.
                </p>
              </form>
            </TabsContent>
          </Tabs>

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