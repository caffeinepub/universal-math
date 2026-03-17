import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, ShoppingCart, Sigma, User, X } from "lucide-react";
import { useState } from "react";
import { type Route, navigate } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCart, useIsAdmin } from "../hooks/useQueries";

interface HeaderProps {
  currentRoute: Route;
}

export default function Header({ currentRoute }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, isLoginSuccess, identity } = useInternetIdentity();
  const { data: cart } = useGetCart();
  const { data: isAdmin } = useIsAdmin();

  const cartCount =
    cart?.items.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  const isActive = (name: string) => currentRoute.name === name;

  const navLinkClass = (name: string) =>
    `text-sm font-medium transition-colors hover:text-foreground ${
      isActive(name)
        ? "text-foreground border-b-2 border-accent pb-0.5"
        : "text-muted-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border nav-blur">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate({ name: "home" })}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sigma className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-lg tracking-tight">
              Universal
              <span className="text-accent font-800"> Math</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              type="button"
              data-ocid="nav.home.link"
              onClick={() => navigate({ name: "home" })}
              className={navLinkClass("home")}
            >
              Home
            </button>
            <button
              type="button"
              data-ocid="nav.shop.link"
              onClick={() => navigate({ name: "shop" })}
              className={navLinkClass("shop")}
            >
              Shop
            </button>
            {isLoginSuccess && (
              <button
                type="button"
                data-ocid="nav.orders.link"
                onClick={() => navigate({ name: "orders" })}
                className={navLinkClass("orders")}
              >
                My Orders
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate({ name: "admin" })}
                className={navLinkClass("admin")}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              data-ocid="nav.cart.button"
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ name: "cart" })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {isLoginSuccess ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">
                    {identity?.getPrincipal().toString().slice(0, 8)}...
                  </span>
                </div>
                <Button
                  data-ocid="nav.logout.button"
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                data-ocid="nav.login.button"
                size="sm"
                onClick={login}
                className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <button
              type="button"
              data-ocid="nav.home.link"
              onClick={() => {
                navigate({ name: "home" });
                setMobileOpen(false);
              }}
              className="block w-full text-left text-sm font-medium py-2 hover:text-foreground text-muted-foreground"
            >
              Home
            </button>
            <button
              type="button"
              data-ocid="nav.shop.link"
              onClick={() => {
                navigate({ name: "shop" });
                setMobileOpen(false);
              }}
              className="block w-full text-left text-sm font-medium py-2 hover:text-foreground text-muted-foreground"
            >
              Shop
            </button>
            {isLoginSuccess && (
              <button
                type="button"
                data-ocid="nav.orders.link"
                onClick={() => {
                  navigate({ name: "orders" });
                  setMobileOpen(false);
                }}
                className="block w-full text-left text-sm font-medium py-2 hover:text-foreground text-muted-foreground"
              >
                My Orders
              </button>
            )}
            {isLoginSuccess ? (
              <Button
                data-ocid="nav.logout.button"
                variant="outline"
                size="sm"
                onClick={clear}
                className="w-full gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            ) : (
              <Button
                data-ocid="nav.login.button"
                size="sm"
                onClick={login}
                className="w-full bg-primary text-primary-foreground"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
