import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RegionProvider } from "@/context/RegionContext";
import "@/i18n/config";

import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import VendorDetailPage from "./pages/VendorDetailPage";
import VendorsPage from "./pages/VendorsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import BatchVerifyPage from "./pages/BatchVerifyPage";
import CalculatorPage from "./pages/CalculatorPage";
import PrivacyPage from "./pages/PrivacyPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import LegalPage from "./pages/LegalPage";
import EducationPage from "./pages/EducationPage";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RegionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
        </BrowserRouter>
      </RegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
