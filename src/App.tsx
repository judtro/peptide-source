import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RegionProvider } from "@/context/RegionContext";
import "@/i18n/config";

import ScrollToTop from "./components/ScrollToTop";

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

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RegionProvider>
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
              <Route path="/education/:slug" element={<ArticlePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </RegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
