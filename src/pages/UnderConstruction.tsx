import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FlaskConical, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'site_access_token';

const passwordSchema = z.string().min(1, 'Please enter a password').max(100, 'Password too long');

interface UnderConstructionProps {
  onAccessGranted: () => void;
}

const UnderConstruction = ({ onAccessGranted }: UnderConstructionProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-site-access', {
        body: { password },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Verification failed');
      }

      if (data?.success && data?.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        onAccessGranted();
      } else {
        setError(data?.error || 'Invalid Credentials');
      }
    } catch (err) {
      console.error('Access verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Hexagonal/Molecular Pattern Overlay */}
        <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
              <polygon 
                points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4" 
                fill="none" 
                stroke="rgba(148, 163, 184, 0.3)" 
                strokeWidth="0.5"
                transform="translate(0, -7.2)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Gradient Orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-4 w-full max-w-md text-center">
        {/* Logo/Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 shadow-2xl backdrop-blur-sm">
          <FlaskConical className="h-12 w-12 text-blue-400" aria-hidden="true" />
        </div>

        {/* Branding */}
        <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          ChemVerify
        </h1>
        
        {/* Status Text */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-sm text-slate-400">
            Platform Status: <span className="text-amber-400">Initializing</span>
          </p>
          <p className="text-xs text-slate-500">
            Database synchronization in progress...
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="mx-auto mb-8 h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <div 
            className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Access Form */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-center gap-2 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider">Authorized Access Only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="border-slate-600 bg-slate-900/50 text-center font-mono text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isLoading}
                autoComplete="off"
                aria-label="Access code"
                aria-describedby={error ? "password-error" : undefined}
              />
            </div>

            {error && (
              <div 
                id="password-error"
                className="flex items-center justify-center gap-2 text-sm text-red-400"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                'Access Platform'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-600">
          © {new Date().getFullYear()} ChemVerify Research Platform
        </p>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default UnderConstruction;
