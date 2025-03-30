
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BuyerLogin from "./pages/BuyerLogin";
import BuyerRegister from "./pages/BuyerRegister";
import SellerLogin from "./pages/SellerLogin";
import SellerRegister from "./pages/SellerRegister";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/buyer-login" element={<BuyerLogin />} />
        <Route path="/buyer-register" element={<BuyerRegister />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-register" element={<SellerRegister />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
