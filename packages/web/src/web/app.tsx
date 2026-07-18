import { Switch, Route } from "wouter";
import { AutumnProvider } from "autumn-js/react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import PairPage from "./pages/Pair";
import SettingsPage from "./pages/Settings";
import PricingPage from "./pages/Pricing";
import LegalPage from "./pages/Legal";

export function App() {
  return (
    <AutumnProvider useBetterAuth>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/legal" component={LegalPage} />
        <Route path="/privacy" component={LegalPage} />
        <Route path="/terms" component={LegalPage} />
        <Route path="/cookies" component={LegalPage} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/pair">
          <ProtectedRoute>
            <PairPage />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>
      </Switch>
    </AutumnProvider>
  );
}

export default App;
