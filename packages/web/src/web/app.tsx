import { Switch, Route } from "wouter";
import { AutumnProvider } from "autumn-js/react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import PairPage from "./pages/Pair";
import SettingsPage from "./pages/Settings";

export function App() {
  return (
    <AutumnProvider useBetterAuth>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
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
