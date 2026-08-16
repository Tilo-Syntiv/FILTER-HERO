import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import Home from "@/pages/Home";
import SizeDetailPage from "@/pages/SizeDetail";
import { AllSizesPage, ThicknessHubPage } from "@/pages/SizeBrowse";
import CustomAirFiltersPage from "@/pages/CustomAirFilters";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";

function ThicknessRoute() {
  const [, params] = useRoute("/filters/:thickness");
  const raw = params?.thickness?.replace("-inch", "") ?? "1";
  const depth = Number(raw);
  return <ThicknessHubPage depth={depth} />;
}

function SizeRoute() {
  const [, params] = useRoute("/sizes/:size");
  const size = params?.size ?? "";
  return <SizeDetailPage sizeSlug={size} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sizes" component={AllSizesPage} />
      <Route path="/sizes/:size" component={SizeRoute} />
      <Route path="/filters/:thickness" component={ThicknessRoute} />
      <Route path="/custom-air-filters" component={CustomAirFiltersPage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
