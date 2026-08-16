import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import BuyBox from "./pages/BuyBox";
import SubmitDeal from "./pages/SubmitDeal";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Collaborate from "./pages/Collaborate";
import HouseHackingGuide from "./pages/HouseHackingGuide";

/**
 * IMPORTANT — these routes are duplicated in `vercel.json`.
 *
 * Production serves this SPA as static files. Only paths listed in the
 * `rewrites` alternation in vercel.json are rewritten to /index.html; every
 * other path returns a real HTTP 404 (deliberate — a blanket catch-all is what
 * caused the soft-404 problem). Adding a <Route> here WITHOUT adding the same
 * path to vercel.json will work in local dev and hard-404 in production.
 *
 * New public routes must also be added to client/public/sitemap.xml.
 * "/404" is intentionally excluded from both.
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/buy-box" component={BuyBox} />
      <Route path="/submit-deal" component={SubmitDeal} />
      <Route path="/resources" component={Resources} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/collaborate" component={Collaborate} />
      <Route path="/househackingguide" component={HouseHackingGuide} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
