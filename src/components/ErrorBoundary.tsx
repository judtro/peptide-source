import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <CardTitle className="text-xl">System Maintenance</CardTitle>
              <CardDescription className="text-muted-foreground">
                We're experiencing temporary difficulties. Our team has been notified and is working to resolve the issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Please try refreshing the page or return to the homepage.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 rounded-lg bg-muted/50 p-3 text-xs">
                  <summary className="cursor-pointer font-medium text-muted-foreground">
                    Developer Details
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-destructive">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
