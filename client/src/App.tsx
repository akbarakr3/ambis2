import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { CartProvider } from "./hooks/use-cart";

// Pages
import Login from "./pages/Login";
import ShopDashboard from "./pages/ShopDashboard";
import ShopMenu from "./pages/ShopMenu";
import ShopScanner from "./pages/ShopScanner";

function PrivateRoute({ component: Component, ...rest }: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("mockUser");
    setIsLoggedIn(!!user);
    setIsLoading(false);
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" /></div>;
  if (!isLoggedIn) return <Redirect to="/" />;
  return <Component {...rest} />;
}

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          
          {/* Admin Routes */}
          <Route path="/shop">
            <PrivateRoute component={ShopDashboard} />
          </Route>
          <Route path="/shop/menu">
            <PrivateRoute component={ShopMenu} />
          </Route>
          <Route path="/shop/scanner">
            <PrivateRoute component={ShopScanner} />
          </Route>

          <Route>
            {() => <Redirect to="/" />}
          </Route>
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <Router />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
