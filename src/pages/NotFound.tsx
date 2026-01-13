import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FlaskConical, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <FlaskConical className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>

        {/* Headline */}
        <h1 className="mb-2 font-mono text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Molecule Not Found</h2>

        {/* Subtext */}
        <p className="mb-8 text-muted-foreground">
          The compound you are looking for does not exist in our verified database. 
          It may have been moved, renamed, or never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button className="min-h-[44px] w-full gap-2 sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              Return to Safety
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="min-h-[44px] gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <p className="mt-8 text-xs text-muted-foreground">
          Need help? Try searching for a specific compound or{' '}
          <Link to="/vendors" className="text-primary underline hover:text-primary/90">
            browse our verified vendors
          </Link>.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
