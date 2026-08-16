import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { SITE_ROUTES, type RoutePath } from "@shared/seo-routes";
import type { ComponentType } from "react";
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
 * The route LIST lives in shared/seo-routes.ts â€” it is the single source of truth for
 * routing, per-route <head> metadata, the prerendered HTML files and sitemap.xml.
 *
 * This map only binds each path to its component. Because it is typed
 * `Record<RoutePath, ...>`, TypeScript fails the build if a route is added to
 * SITE_ROUTES without a page here, or a page is added here without a SITE_ROUTES
 * entry â€” the "forgot to update the other file" hard-404 cannot happen.
 *
 * "/404" is deliberately NOT in the table: it must not be prerendered, indexed or
 * listed in the sitemap, so it is wired up by hand below.
 */
const PAGES: Record<RoutePath, ComponentType> = {
  "/": Home,
  "/about": About,
  "/buy-box": BuyBox,
  "/submit-deal": SubmitDeal,
  "/resources": Resources,
  "/contact": Contact,
  "/privacy": Privacy,
  "/collaborate": Collaborate,
  "/househackingguide": HouseHackingGuide,
};

function Router() {
  return (
    <Switch>
      {SITE_ROUTES.map((route) => {
        const Page = PAGES[route.path];
        return (
          <Route key={route.path} path={route.path}>
            <Page />
          </Route>
        );
      })}
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
