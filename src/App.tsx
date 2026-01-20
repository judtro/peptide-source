import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RegionProvider } from "@/context/RegionContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/i18n/config";

import ScrollToTop from "./components/ScrollToTop";
import UnderConstruction from "./pages/UnderConstruction";

// Eagerly load critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for code splitting
const VendorDetailPage = lazy(() => import("./pages/VendorDetailPage"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const BatchVerifyPage = lazy(() => import("./pages/BatchVerifyPage"));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const EducationPage = lazy(() => import("./pages/EducationPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const VideoGalleryPage = lazy(() => import("./pages/VideoGalleryPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const AdminRoute = lazy(() => import("./pages/admin/AdminRoute"));

const queryClient = new QueryClient();

const STORAGE_KEY = 'site_access_token';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Validate the stored token format and expiration
const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  
  // Token format: timestamp:hash
  const parts = token.split(':');
  if (parts.length !== 2) return false;
  
  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return false;
  
  // Check if token has expired (24 hours)
  const now = Date.now();
  if (now - timestamp > TOKEN_EXPIRY_MS) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  
  // Verify hash exists and has correct length (32 hex chars)
  const hash = parts[1];
  if (!hash || hash.length !== 32 || !/^[a-f0-9]+$/.test(hash)) return false;
  
  return true;
};

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    return isValidToken(token);
  });

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
  };

  // Show Under Construction gate if not authenticated
  if (!isAuthenticated) {
    return <UnderConstruction onAccessGranted={handleAccessGranted} />;
  }

  // Render the main application if authenticated
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminAuthProvider>
            <RegionProvider>
              <CurrencyProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/vendors" element={<VendorsPage />} />
                      <Route path="/vendor/:slug" element={<VendorDetailPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/verify" element={<BatchVerifyPage />} />
                      <Route path="/calculator" element={<CalculatorPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/disclaimer" element={<DisclaimerPage />} />
                      <Route path="/legal" element={<LegalPage />} />
                      <Route path="/education" element={<EducationPage />} />
                      <Route path="/education/videos" element={<VideoGalleryPage />} />
                      <Route path="/education/:slug" element={<ArticlePage />} />
                      <Route path="/partners" element={<PartnersPage />} />
                      <Route path="/admin" element={<AdminRoute />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </CurrencyProvider>
            </RegionProvider>
          </AdminAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
